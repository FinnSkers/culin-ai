'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createInviteCode, getAdminDashboardData } from '@/app/admin/actions';
import { type AdminUser, type AdminInviteCode } from '@/lib/types';
import { Loader2, Shield, Users, Ticket, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export function AdminDashboard() {
  const [data, setData] = useState<{ users: AdminUser[], inviteCodes: AdminInviteCode[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreatingCode, setIsCreatingCode] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const adminData = await getAdminDashboardData();
      setData(adminData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCode = async (formData: FormData) => {
    setIsCreatingCode(true);
    const result = await createInviteCode(formData);

    if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else if (result.success) {
        toast({ title: 'Success!', description: result.message });
        formRef.current?.reset();
        // Refetch data to show the new code
        setLoading(true);
        fetchData();
    }
    setIsCreatingCode(false);
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield /> Admin Dashboard</CardTitle>
          <CardDescription>Loading mission control...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
                {error}
            </AlertDescription>
        </Alert>
    )
  }

  const userEmailMap = new Map(data?.users.map(u => [u.id, u.email]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Shield /> Admin Dashboard</CardTitle>
        <CardDescription>Manage users and invite codes from mission control.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users"><Users className="mr-2" /> Users ({data?.users.length})</TabsTrigger>
            <TabsTrigger value="invite-codes"><Ticket className="mr-2" /> Invite Codes ({data?.inviteCodes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
             <ScrollArea className="h-96">
                <Table>
                    <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                        <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                            </TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </ScrollArea>
          </TabsContent>

          <TabsContent value="invite-codes" className="mt-4">
            <div className="space-y-4">
                <form action={handleCreateCode} ref={formRef} className="flex items-center gap-2">
                    <Input name="code" placeholder="New invite code" required disabled={isCreatingCode} />
                    <Button type="submit" disabled={isCreatingCode}>
                        {isCreatingCode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create
                    </Button>
                </form>
                <ScrollArea className="h-96">
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                            <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Used By</TableHead>
                            <TableHead>Used At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.inviteCodes.map((code) => (
                            <TableRow key={code.id}>
                                <TableCell className="font-mono">{code.code}</TableCell>
                                <TableCell>
                                    <Badge variant={code.is_used ? 'destructive' : 'secondary'}>
                                        {code.is_used ? 'Used' : 'Available'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{code.used_by ? userEmailMap.get(code.used_by) || code.used_by.substring(0,8)+'...' : 'N/A'}</TableCell>
                                <TableCell>{code.used_at ? new Date(code.used_at).toLocaleString() : 'N/A'}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
