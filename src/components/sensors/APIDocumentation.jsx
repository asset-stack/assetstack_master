import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, CheckCircle, Server, Zap, Lock, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function APIDocumentation() {
  const [copiedSection, setCopiedSection] = useState(null);
  
  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const apiEndpoint = `${window.location.origin}/api/functions/ingestSensorData`;

  const singleReadingExample = `{
  "readings": [
    {
      "equipment_id": "your-equipment-uuid",
      "sensor_type": "temperature",
      "value": 45.2,
      "unit": "°C",
      "timestamp": "2024-01-15T10:30:00Z",
      "threshold_min": 20,
      "threshold_max": 80
    }
  ]
}`;

  const batchReadingExample = `{
  "readings": [
    {
      "equipment_id": "equipment-uuid-1",
      "sensor_type": "temperature",
      "value": 45.2,
      "unit": "°C"
    },
    {
      "equipment_id": "equipment-uuid-1",
      "sensor_type": "vibration",
      "value": 2.5,
      "unit": "mm/s"
    },
    {
      "equipment_id": "equipment-uuid-2",
      "sensor_type": "pressure",
      "value": 3.8,
      "unit": "bar"
    }
  ]
}`;

  const externalIdExample = `{
  "equipment_external_id": "MOTOR-001",
  "readings": [
    {
      "sensor_type": "temperature",
      "value": 45.2,
      "external_sensor_id": "TEMP-SENSOR-A1"
    }
  ]
}`;

  const curlExample = `curl -X POST "${apiEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "readings": [
      {
        "equipment_id": "your-equipment-uuid",
        "sensor_type": "temperature",
        "value": 45.2
      }
    ]
  }'`;

  const pythonExample = `import requests

API_ENDPOINT = "${apiEndpoint}"
API_KEY = "YOUR_API_KEY"

def send_sensor_data(readings):
    response = requests.post(
        API_ENDPOINT,
        json={"readings": readings},
        headers={
            "Content-Type": "application/json",
            "x-api-key": API_KEY
        }
    )
    return response.json()

# Example usage
readings = [
    {
        "equipment_id": "your-equipment-uuid",
        "sensor_type": "temperature",
        "value": 45.2,
        "unit": "°C"
    },
    {
        "equipment_id": "your-equipment-uuid",
        "sensor_type": "vibration",
        "value": 2.5,
        "unit": "mm/s"
    }
]

result = send_sensor_data(readings)
print(f"Processed: {result['processed']}, Failed: {result['failed']}")`;

  const nodeExample = `const axios = require('axios');

const API_ENDPOINT = "${apiEndpoint}";
const API_KEY = "YOUR_API_KEY";

async function sendSensorData(readings) {
  const response = await axios.post(
    API_ENDPOINT,
    { readings },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      }
    }
  );
  return response.data;
}

// Example usage
const readings = [
  {
    equipment_id: "your-equipment-uuid",
    sensor_type: "temperature",
    value: 45.2,
    unit: "°C"
  }
];

sendSensorData(readings)
  .then(result => console.log(result))
  .catch(err => console.error(err));`;

  const responseExample = `{
  "success": true,
  "received": 3,
  "processed": 3,
  "failed": 0,
  "errors": [],
  "processing_time_ms": 125
}`;

  const CodeBlock = ({ code, language, section }) => (
    <div className="relative">
      <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => copyToClipboard(code, section)}
        className="absolute top-2 right-2 text-slate-400 hover:text-white"
      >
        {copiedSection === section ? (
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Server className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Sensor Data API</h2>
            <p className="text-slate-600 mb-4">
              Integrate your IoT devices, PLCs, SCADA systems, or any sensor data source with our REST API.
              Send real-time sensor readings that automatically trigger anomaly detection and alerts.
            </p>
            <div className="flex items-center gap-4">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <Zap className="w-3 h-3 mr-1" />
                Real-time Processing
              </Badge>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                <Lock className="w-3 h-3 mr-1" />
                API Key Authentication
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoint */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">API Endpoint</h3>
        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-4">
          <Badge className="bg-emerald-600 text-white">POST</Badge>
          <code className="text-sm text-slate-700 flex-1 break-all">{apiEndpoint}</code>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(apiEndpoint, 'endpoint')}
            className="text-slate-500"
          >
            {copiedSection === 'endpoint' ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Request Format */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Request Format</h3>
        
        <Tabs defaultValue="single" className="space-y-4">
          <TabsList className="bg-slate-100">
            <TabsTrigger value="single">Single Reading</TabsTrigger>
            <TabsTrigger value="batch">Batch Readings</TabsTrigger>
            <TabsTrigger value="external">External IDs</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <CodeBlock code={singleReadingExample} language="json" section="single" />
          </TabsContent>

          <TabsContent value="batch">
            <CodeBlock code={batchReadingExample} language="json" section="batch" />
          </TabsContent>

          <TabsContent value="external">
            <p className="text-sm text-slate-600 mb-4">
              If you use external equipment IDs (like serial numbers), you can reference them instead of UUIDs:
            </p>
            <CodeBlock code={externalIdExample} language="json" section="external" />
          </TabsContent>
        </Tabs>

        {/* Field Reference */}
        <div className="mt-6 border-t border-slate-200 pt-6">
          <h4 className="font-medium text-slate-900 mb-4">Field Reference</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Field</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Required</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2 font-mono text-indigo-600">equipment_id</td>
                  <td className="px-4 py-2 text-slate-600">string</td>
                  <td className="px-4 py-2"><Badge variant="outline" className="text-emerald-600 border-emerald-200">Yes*</Badge></td>
                  <td className="px-4 py-2 text-slate-600">Equipment UUID or use external_equipment_id</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-indigo-600">sensor_type</td>
                  <td className="px-4 py-2 text-slate-600">string</td>
                  <td className="px-4 py-2"><Badge variant="outline" className="text-emerald-600 border-emerald-200">Yes</Badge></td>
                  <td className="px-4 py-2 text-slate-600">temperature, vibration, pressure, current, etc.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-indigo-600">value</td>
                  <td className="px-4 py-2 text-slate-600">number</td>
                  <td className="px-4 py-2"><Badge variant="outline" className="text-emerald-600 border-emerald-200">Yes</Badge></td>
                  <td className="px-4 py-2 text-slate-600">Sensor reading value</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-indigo-600">unit</td>
                  <td className="px-4 py-2 text-slate-600">string</td>
                  <td className="px-4 py-2"><Badge variant="outline" className="text-slate-400 border-slate-200">No</Badge></td>
                  <td className="px-4 py-2 text-slate-600">Unit of measurement (°C, bar, mm/s, etc.)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-indigo-600">timestamp</td>
                  <td className="px-4 py-2 text-slate-600">ISO 8601</td>
                  <td className="px-4 py-2"><Badge variant="outline" className="text-slate-400 border-slate-200">No</Badge></td>
                  <td className="px-4 py-2 text-slate-600">Reading timestamp (defaults to now)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-indigo-600">threshold_min/max</td>
                  <td className="px-4 py-2 text-slate-600">number</td>
                  <td className="px-4 py-2"><Badge variant="outline" className="text-slate-400 border-slate-200">No</Badge></td>
                  <td className="px-4 py-2 text-slate-600">Alert thresholds (uses config if not provided)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-indigo-600" />
          Code Examples
        </h3>
        
        <Tabs defaultValue="curl" className="space-y-4">
          <TabsList className="bg-slate-100">
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="node">Node.js</TabsTrigger>
          </TabsList>

          <TabsContent value="curl">
            <CodeBlock code={curlExample} language="bash" section="curl" />
          </TabsContent>

          <TabsContent value="python">
            <CodeBlock code={pythonExample} language="python" section="python" />
          </TabsContent>

          <TabsContent value="node">
            <CodeBlock code={nodeExample} language="javascript" section="node" />
          </TabsContent>
        </Tabs>
      </div>

      {/* Response */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Response Format</h3>
        <CodeBlock code={responseExample} language="json" section="response" />
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">success</p>
            <p className="font-medium text-slate-900">boolean</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">received</p>
            <p className="font-medium text-slate-900">Total readings sent</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">processed</p>
            <p className="font-medium text-slate-900">Successfully saved</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">failed</p>
            <p className="font-medium text-slate-900">Failed to process</p>
          </div>
        </div>
      </div>

      {/* Sensor Types */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Supported Sensor Types</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'vibration', 'temperature', 'pressure', 'current', 'voltage', 'flow_rate',
            'rpm', 'humidity', 'noise_level', 'oil_quality', 'strain', 'displacement',
            'crack_width', 'tilt', 'acceleration', 'corrosion', 'moisture', 'wind_speed',
            'structural_load', 'deflection', 'water_level'
          ].map(type => (
            <Badge key={type} variant="outline" className="capitalize">
              {type.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}