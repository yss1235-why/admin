import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

interface SubscriptionRecord {
  action: 'extend' | 'suspend' | 'reactivate';
  duration?: number;
  note?: string;
  timestamp: number;
  previousEnd: number;
  newEnd: number;
}

interface HostSubscriptionHistory {
  hostId: string;
  hostName: string;
  email: string;
  records: SubscriptionRecord[];
}

const SubscriptionHistory: React.FC = () => {
  const [history, setHistory] = useState<HostSubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHost, setSelectedHost] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'7' | '30' | '90' | 'all'>('all');

  useEffect(() => {
    fetchSubscriptionHistory();
  }, []);

  const fetchSubscriptionHistory = async () => {
    try {
      // Fetch hosts data
      const hostsRef = ref(database, 'hosts');
      const hostsSnapshot = await get(hostsRef);
      const hostsData: Record<string, Host> = hostsSnapshot.val() || {};

      // Fetch subscription history
      const historyRef = ref(database, 'subscriptionHistory');
      const historySnapshot = await get(historyRef);
      const historyData = historySnapshot.val() || {};

      // Process and combine the data
      const processedHistory: HostSubscriptionHistory[] = Object.entries(historyData)
        .map(([hostId, records]: [string, any]) => ({
          hostId,
          hostName: hostsData[hostId]?.username || 'Unknown Host',
          email: hostsData[hostId]?.email || 'N/A',
          records: Object.entries(records)
            .map(([recordId, record]: [string, any]) => ({
              ...record,
              id: recordId,
            }))
            .sort((a, b) => b.timestamp - a.timestamp),
        }))
        .filter(host => host.records.length > 0);

      setHistory(processedHistory);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch subscription history');
      setLoading(false);
    }
  };

  const filterHistory = () => {
    const filteredHistory = history.filter(host => {
      // Filter by host
      if (selectedHost !== 'all' && host.hostId !== selectedHost) return false;

      // Filter by search term
      if (searchTerm && !host.hostName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !host.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      // Filter by date
      if (dateFilter !== 'all') {
        const cutoffDate = Date.now() - (parseInt(dateFilter) * 24 * 60 * 60 * 1000);
        if (!host.records.some(record => record.timestamp >= cutoffDate)) return false;
      }

      return true;
    });

    return filteredHistory;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'extend':
        return 'bg-green-100 text-green-800';
      case 'suspend':
        return 'bg-red-100 text-red-800';
      case 'reactivate':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <CardTitle>Subscription History</CardTitle>
          <CardDescription>
            View and track all subscription-related activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <Select
                value={selectedHost}
                onValueChange={setSelectedHost}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Host" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hosts</SelectItem>
                  {history.map(host => (
                    <SelectItem key={host.hostId} value={host.hostId}>
                      {host.hostName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by host name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select
                value={dateFilter}
                onValueChange={(value: '7' | '30' | '90' | 'all') => setDateFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Host</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Previous End</TableHead>
                <TableHead>New End</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterHistory().map(host => (
                host.records.map(record => (
                  <TableRow key={`${host.hostId}-${record.timestamp}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{host.hostName}</div>
                        <div className="text-sm text-gray-500">{host.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getActionColor(record.action)}`}>
                        {record.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(record.timestamp)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {record.duration && (
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {record.duration} days
                        </span>
                      )}
                      {record.note && (
                        <div className="text-sm text-gray-500 mt-1">
                          {record.note}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(record.previousEnd)}</TableCell>
                    <TableCell>{formatDate(record.newEnd)}</TableCell>
                  </TableRow>
                ))
              ))}
            </TableBody>
          </Table>

          {filterHistory().length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No subscription history found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionHistory;