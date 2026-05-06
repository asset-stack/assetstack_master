import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Simulates a continuous ML retraining job.
// In a real deployment this would push labeled data to an external ML platform (SageMaker/Vertex AI).
// Here we compute improved metrics from human-verified ConditionReport feedback and bump the model version.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Gather verified training samples
    const verified = await base44.asServiceRole.entities.ConditionReport.filter({
      used_for_training: false,
    });
    const trainable = verified.filter(
      (r) => r.review_status === 'approved' || r.review_status === 'corrected' || r.review_status === 'rejected'
    );

    if (trainable.length === 0) {
      return Response.json({
        success: false,
        message: 'No new verified samples available for retraining.',
      });
    }

    // Get current active model (or create baseline)
    const existing = await base44.asServiceRole.entities.MLModel.filter({
      model_type: 'failure_classification',
    }, '-training_date', 1);

    const current = existing?.[0];
    const prevAccuracy = current?.accuracy_score || 70;

    // Simulate accuracy improvement from new labeled data
    const approved = trainable.filter((r) => r.review_status === 'approved').length;
    const corrected = trainable.filter((r) => r.review_status === 'corrected').length;
    const rejected = trainable.filter((r) => r.review_status === 'rejected').length;

    // Corrections and rejections teach the model the most
    const improvement = Math.min(
      (approved * 0.1 + corrected * 0.5 + rejected * 0.3),
      30 - (prevAccuracy - 70) * 0.5
    );
    const newAccuracy = Math.min(prevAccuracy + improvement, 99);

    const prevVersion = current?.version || 'v1.0';
    const versionNum = parseFloat(prevVersion.replace('v', '')) || 1.0;
    const newVersion = `v${(versionNum + 0.1).toFixed(1)}`;

    // Deactivate old model
    if (current) {
      await base44.asServiceRole.entities.MLModel.update(current.id, { status: 'deprecated' });
    }

    // Create new active model
    const newModel = await base44.asServiceRole.entities.MLModel.create({
      model_name: 'Asset Condition Detector',
      model_type: 'failure_classification',
      algorithm: 'neural_network',
      version: newVersion,
      equipment_type: 'facility_general',
      training_data_size: trainable.length + (current?.training_data_size || 0),
      features: ['image_pixels', 'texture_features', 'edge_detection', 'color_histogram'],
      training_date: new Date().toISOString().split('T')[0],
      last_validation_date: new Date().toISOString().split('T')[0],
      status: 'active',
      accuracy_score: newAccuracy,
      false_positive_rate: Math.max(2, 15 - (newAccuracy - 70) * 0.3),
      false_negative_rate: Math.max(1, 10 - (newAccuracy - 70) * 0.2),
      performance_metrics: {
        precision: newAccuracy / 100,
        recall: (newAccuracy - 2) / 100,
        f1_score: (newAccuracy - 1) / 100,
        samples_trained: trainable.length,
      },
      feature_importance: {
        approved_samples: approved,
        corrected_samples: corrected,
        rejected_samples: rejected,
      },
    });

    // Mark samples as used
    for (const r of trainable) {
      await base44.asServiceRole.entities.ConditionReport.update(r.id, { used_for_training: true });
    }

    // Audit log — model retraining is a high-impact event
    try {
      await base44.asServiceRole.entities.AuditLogEntry.create({
        actor_email: user.email,
        actor_role: user.role || 'user',
        action: 'ml.retrain',
        category: 'ai',
        severity: 'warning',
        target_entity: 'MLModel',
        target_id: newModel.id,
        target_name: `${newModel.model_name} ${newVersion}`,
        summary: `Retrained model ${prevVersion} → ${newVersion} (+${(newAccuracy - prevAccuracy).toFixed(1)}% accuracy)`,
        metadata: {
          previous_version: prevVersion,
          new_version: newVersion,
          samples_used: trainable.length,
          breakdown: { approved, corrected, rejected },
        },
        ip_hint: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        outcome: 'success',
      });
    } catch (e) {
      console.warn('Audit log write failed:', e.message);
    }

    return Response.json({
      success: true,
      previous_version: prevVersion,
      new_version: newVersion,
      previous_accuracy: prevAccuracy,
      new_accuracy: newAccuracy,
      improvement: newAccuracy - prevAccuracy,
      samples_used: trainable.length,
      breakdown: { approved, corrected, rejected },
      model: newModel,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});