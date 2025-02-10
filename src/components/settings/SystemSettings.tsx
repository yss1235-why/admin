import React, { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { database } from '../../config/firebase.config';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  Database, 
  Save, 
  RefreshCcw, 
  AlertCircle,
  CheckCircle 
} from 'lucide-react';

interface SystemConfig {
  backupFrequency: string;
  retentionPeriod: string;
  maintenanceMode: boolean;
  lastBackup: number;
  lastMaintenance: number;
}

const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    backupFrequency: 'daily',
    retentionPeriod: '30',
    maintenanceMode: false,
    lastBackup: 0,
    lastMaintenance: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  const fetchSystemConfig = async () => {
    try {
      const configRef = ref(database, 'systemConfig');
      const snapshot = await get(configRef);
      if (snapshot.exists()) {
        setConfig(snapshot.val());
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch system configuration');
      setLoading(false);
    }
  };

  const saveSystemConfig = async () => {
    try {
      setSaving(true);
      setError(null);
      await set(ref(database, 'systemConfig'), config);
      setSuccessMessage('System configuration saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to save system configuration');
    } finally {
      setSaving(false);
    }
  };

  const performBackup = async () => {
    try {
      setError(null);
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newConfig = {
        ...config,
        lastBackup: Date.now()
      };
      await set(ref(database, 'systemConfig'), newConfig);
      setConfig(newConfig);
      setSuccessMessage('System backup completed successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to perform system backup');
    }
  };

  const performMaintenance = async () => {
    try {
      setError(null);
      // Simulate maintenance process
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newConfig = {
        ...config,
        lastMaintenance: Date.now()
      };
      await set(ref(database, 'systemConfig'), newConfig);
      setConfig(newConfig);
      setSuccessMessage('System maintenance completed successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to perform system maintenance');
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            System Settings
          </CardTitle>
          <CardDescription>
            Configure system maintenance and backup settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="backup">
            <TabsList>
              <TabsTrigger value="backup">Backup Settings</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="backup" className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Select
                    value={config.backupFrequency}
                    onValueChange={(value) => setConfig({
                      ...config,
                      backupFrequency: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data Retention Period (days)</Label>
                  <Select
                    value={config.retentionPeriod}
                    onValueChange={(value) => setConfig({
                      ...config,
                      retentionPeriod: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">365 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">
                      Last Backup: {formatDate(config.lastBackup)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={performBackup}
                      className="ml-4"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Backup Now
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Maintenance Mode</h3>
                    <p className="text-sm text-gray-500">
                      Enable maintenance mode to prevent user access during system updates
                    </p>
                  </div>
                  <Button
                    variant={config.maintenanceMode ? "destructive" : "outline"}
                    onClick={() => setConfig({
                      ...config,
                      maintenanceMode: !config.maintenanceMode
                    })}
                  >
                    {config.maintenanceMode ? 'Disable' : 'Enable'} Maintenance Mode
                  </Button>
                </div>

                <div className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Last Maintenance: {formatDate(config.lastMaintenance)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={performMaintenance}
                      className="ml-4"
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Run Maintenance
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Database Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Hosts</span>
                        <span className="font-medium">Loading...</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Database Size</span>
                        <span className="font-medium">Loading...</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Active Connections</span>
                        <span className="font-medium">Loading...</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button 
              onClick={saveSystemConfig}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;