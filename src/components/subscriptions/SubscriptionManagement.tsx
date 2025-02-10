import React, { useState, useEffect } from 'react';
import { ref, get, update } from 'firebase/database';
import { database, Host } from '../../config/firebase.config';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Calendar, AlertCircle, Clock } from 'lucide-react';

interface ExtendedHost extends Host {
  id: string;
  daysRemaining: number;
  status: 'active' | 'inactive';
}

const SubscriptionManagement: React.FC = () => {
  const [hosts, setHosts] = useState<ExtendedHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHost, setSelectedHost] = useState<ExtendedHost | null>(null);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [extensionPeriod, setExtensionPeriod] = useState('30');
  const [subscriptionNote, setSubscriptionNote] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const hostsRef = ref(database, 'hosts');
      const snapshot = await get(hostsRef);
      
      if (snapshot.exists()) {
        const hostsData = snapshot.val();
        const processedHosts: ExtendedHost[] = Object.entries(hostsData)
          .map(([id, host]: [string, any]) => {
            const daysRemaining = Math.ceil(
              (host.subscriptionEnd - Date.now()) / (1000 * 60 * 60 * 24)
            );
            return {
              ...host,
              id,
              daysRemaining,
            };
          })
          .sort((a, b) => a.daysRemaining - b.daysRemaining);

        setHosts(processedHosts);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch subscription data');
      setLoading(false);
    }
  };

  const handleExtendSubscription = async () => {
    if (!selectedHost) return;

    try {
      const extensionDays = parseInt(extensionPeriod);
      const newEndDate = selectedHost.subscriptionEnd + (extensionDays * 24 * 60 * 60 * 1000);

      const updates: Record<string, any> = {
        [`hosts/${selectedHost.id}/subscriptionEnd`]: newEndDate,
        [`hosts/${selectedHost.id}/status`]: 'active',
        [`subscriptionHistory/${selectedHost.id}/${Date.now()}`]: {
          action: 'extend',
          duration: extensionDays,
          note: subscriptionNote,
          timestamp: Date.now(),
          previousEnd: selectedHost.subscriptionEnd,
          newEnd: newEndDate
        }
      };

      await update(ref(database), updates);
      await fetchSubscriptions();
      setIsExtendDialogOpen(false);
      setSubscriptionNote('');
      setExtensionPeriod('30');
      
    } catch (err) {
      setError('Failed to extend subscription');
    }
  };

  const getStatusBadgeClass = (daysRemaining: number) => {
    if (daysRemaining <= 0) return 'bg-red-100 text-red-800';
    if (daysRemaining <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subscription Management</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Host</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Days Remaining</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hosts.map((host) => (
            <TableRow key={host.id}>
              <TableCell className="font-medium">{host.username}</TableCell>
              <TableCell>{host.email}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    getStatusBadgeClass(host.daysRemaining)
                  }`}
                >
                  {host.daysRemaining <= 0 ? 'Expired' : 'Active'}
                </span>
              </TableCell>
              <TableCell>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {host.daysRemaining} days
                </span>
              </TableCell>
              <TableCell>{formatDate(host.subscriptionEnd)}</TableCell>
              <TableCell className="text-right">
                <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedHost(host)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Extend
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Extend Subscription</DialogTitle>
                      <DialogDescription>
                        Extend the subscription period for {selectedHost?.username}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Extension Period</Label>
                        <Select
                          value={extensionPeriod}
                          onValueChange={setExtensionPeriod}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 Days</SelectItem>
                            <SelectItem value="90">90 Days</SelectItem>
                            <SelectItem value="180">180 Days</SelectItem>
                            <SelectItem value="365">365 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Note (Optional)</Label>
                        <Input
                          value={subscriptionNote}
                          onChange={(e) => setSubscriptionNote(e.target.value)}
                          placeholder="Add a note about this extension"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleExtendSubscription}>
                        Confirm Extension
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {hosts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No subscription data available</p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;