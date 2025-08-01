
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { users as defaultUsers, type UserRecord } from '@/lib/users';

const Logo = () => (
    <svg
      width="40"
      height="40"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-md"
    >
      <rect width="100" height="100" fill="#f46f02" />
      <text
        x="50"
        y="78"
        fontFamily="Arial, sans-serif"
        fontSize="50"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
      >
        B&Q
      </text>
    </svg>
  );

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<Record<string, { password: string, role: string }>>({});

  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const parsedUsers: UserRecord[] = JSON.parse(storedUsers);
      const usersRecord = parsedUsers.reduce((acc, user) => {
        acc[user.username.toLowerCase()] = { password: user.password, role: user.role };
        return acc;
      }, {} as Record<string, { password: string, role: string }>);
      setUsers(usersRecord);
    } else {
      setUsers(defaultUsers);
      const userRecords = Object.entries(defaultUsers).map(([username, data]) => ({...data, username}));
      localStorage.setItem('users', JSON.stringify(userRecords));
    }
  }, []);

  const handleLogin = () => {
    const user = users[username.toLowerCase()];
    if (user && user.password === password) {
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('user', JSON.stringify({ username, role: user.role }));
      router.push('/dashboard');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
            <Logo />
          <CardTitle className="text-2xl">B&Q Discount Card Management System</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="admin"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin}>
            Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
