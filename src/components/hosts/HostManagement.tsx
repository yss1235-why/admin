import React, { useState, useEffect } from 'react';
import { ref, get, set, remove } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { database } from '../../config/firebase.config';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Edit2, Trash2, Key } from 'lucide-react';

interface HostFormData {
  username: string;
  email: string;
  password?: string; // Optional for editing
  status: 'active' | 'inactive';
  subscriptionEnd: number;
}

interface Host {
  username: string;
  email: string;
  status: 'active' | 'inactive';
  subscriptionEnd: number;
  lastLogin: number;
  role: 'host';
}

const HostManagement: React.FC = () => {
  const [hosts, setHosts] = useState<Record<string, Host>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentHost, setCurrentHost] = useState<string | null>(null);
  const [formData, setFormData] = useState<HostFormData>({
    username: '',
    email: '',
    password: '',
    status: 'active',
    subscriptionEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
  });
  const [newPassword, setNewPassword] = useState('');
  const [selectedHostForPassword, setSelectedHostForPassword] = useState<string | null>(null);

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      const hostsRef = ref(database, 'hosts');
      const snapshot = await get(hostsRef);
      if (snapshot.exists()) {
        setHosts(snapshot.val());
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch hosts data');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as 'active' | 'inactive'
    }));
  };

  const createHostAccount = async () => {
    try {
      const auth = getAuth();
      
      // Create authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password!
      );

      const hostId = userCredential.user.uid;
      
      // Create host record in database
      const hostData: Host = {
        username: formData.username,
        email: formData.email,
        status: formData.status,
        subscriptionEnd: formData.subscriptionEnd,
        lastLogin: Date.now(),
        role: 'host'
      };

      await set(ref(database, `hosts/${hostId}`), hostData);
      await fetchHosts();
      return true;
    } catch (error: any) {
      console.error('Error creating host:', error);
      throw new Error(error.message || 'Failed to create host account');
    }
  };

  const updateHostAccount = async (hostId: string) => {
    try {
      const hostData: Partial<Host> = {
        username: formData.username,
        email: formData.email,
        status: formData.status,
        subscriptionEnd: formData.subscriptionEnd
      };

      await set(ref(database, `hosts/${hostId}`), {
        ...hosts[hostId],
        ...hostData
      });
      
      await fetchHosts();
      return true;
    } catch (error) {
      console.error('Error updating host:', error);
      throw new Error('Failed to update host account');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentHost) {
        // Create new host
        if (!formData.password) {
          throw new Error('Password is required for new host accounts');
        }
        await createHostAccount();
      } else {
        // Update existing host
        await updateHostAccount(currentHost);
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save host data');
    }
  };

  const handleEdit = (hostId: string, hostData: Host) => {
    setCurrentHost(hostId);
    setFormData({
      username: hostData.username,
      email: hostData.email,
      status: hostData.status,
      subscriptionEnd: hostData.subscriptionEnd
    });
    setIsDialogOpen(true);
  };

  const handlePasswordChange = (hostId: string) => {
    setSelectedHostForPassword(hostId);
    setNewPassword('');
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordUpdate = async () => {
    try {
      // Here you would implement the password update logic
      // This requires additional Firebase Admin SDK setup or a custom backend endpoint
      // for security reasons
      setError('Password update functionality requires backend implementation');
      setIsPasswordDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    }
  };

  const handleDelete = async (hostId: string) => {
    if (window.confirm('Are you sure you want to delete this host?')) {
      try {
        await remove(ref(database, `hosts/${hostId}`));
        await fetchHosts();
      } catch (err) {
        setError('Failed to delete host');
      }
    }
  };

  const resetForm = () => {
    setCurrentHost(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      status: 'active',
      subscriptionEnd: Date.now() + 30 * 24 * 60 * 60 * 1000
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
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
      {/* Main Content */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Host Management</h1>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Host
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Host Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentHost ? 'Edit Host' : 'Add New Host'}
            </DialogTitle>
            <DialogDescription>
              Enter the details for the host account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {!currentHost && (
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subscription End Date</Label>
              <Input
                name="subscriptionEnd"
                type="date"
                value={new Date(formData.subscriptionEnd).toISOString().split('T')[0]}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    subscriptionEnd: new Date(e.target.value).getTime()
                  }));
                }}
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit">
                {currentHost ? 'Save Changes' : 'Create Host'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Host Password</DialogTitle>
            <DialogDescription>
              Enter the new password for the host account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <DialogFooter>
              <Button onClick={handlePasswordUpdate}>
                Update Password
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hosts Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Subscription End</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(hosts).map(([hostId, host]) => (
            <TableRow key={hostId}>
              <TableCell>{host.username}</TableCell>
              <TableCell>{host.email}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    host.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {host.status}
                </span>
              </TableCell>
              <TableCell>{formatDate(host.subscriptionEnd)}</TableCell>
              <TableCell>{formatDate(host.lastLogin)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(hostId, host)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePasswordChange(hostId)}
                  >
                    <Key className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(hostId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HostManagement;