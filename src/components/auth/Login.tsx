"use client";

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Loader2, Smartphone, AtSign, User, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from '@/context/UserContext';
import { addUser, getUser } from '@/lib/db';
import { LanguageContext, languages } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';

export default function Login() {
    const router = useRouter();
    const { toast } = useToast();
    const { login } = useUser();
    const langContext = useContext(LanguageContext);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            if (email && password) {
                let user = getUser(email);
                if (!user) {
                    user = addUser({ id: email, email, mobile: '', password });
                }
                login(user);
                loginSuccess();
            } else {
                loginFailure("Please enter your email and password.");
            }
        }, 1000);
    };
    
    const handleMobileLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            if (mobile && mobile.length >= 10) {
                 let user = getUser(mobile);
                 if (!user) {
                    user = addUser({ id: mobile, email: '', mobile, password: '' });
                 }
                 login(user);
                 loginSuccess();
            } else {
                loginFailure("Please enter a valid mobile number.");
            }
        }, 1000);
    };

    const handleGuestLogin = () => {
        setIsLoading(true);
        setTimeout(() => {
            const guestId = `guest_${Date.now()}`;
            const user = addUser({ id: guestId, email: 'Guest User', mobile: '', password: '' });
            login(user);
            loginSuccess("Welcome, Guest!");
        }, 500);
    };

    const loginSuccess = (title: string = "Login Successful") => {
        toast({
            title: title,
            description: "Redirecting to your dashboard...",
        });
        router.push('/dashboard');
    }

    const loginFailure = (description: string) => {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: description,
        });
        setIsLoading(false);
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-md shadow-2xl border-primary/20">
                <CardHeader className="text-center">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <Leaf className="text-primary h-10 w-10" />
                        <h1 className="text-4xl font-headline font-bold text-foreground">
                            FarmAssist
                        </h1>
                    </div>
                    <CardTitle className="text-2xl">Welcome!</CardTitle>
                    <CardDescription>Sign in to access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="language-select" className="flex items-center gap-2"><Languages /> Preferred Language</Label>
                         <Select value={langContext?.languageCode} onValueChange={langContext?.setLanguageCode}>
                            <SelectTrigger id="language-select" className="w-full">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                            <ScrollArea className="h-72">
                                {languages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                </SelectItem>
                                ))}
                            </ScrollArea>
                            </SelectContent>
                        </Select>
                    </div>


                    <Tabs defaultValue="email" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="email"><AtSign className="mr-2 h-4 w-4"/>Email</TabsTrigger>
                            <TabsTrigger value="mobile"><Smartphone className="mr-2 h-4 w-4"/>Mobile</TabsTrigger>
                        </TabsList>
                        <TabsContent value="email" className="pt-4">
                             <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="farmer@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="********"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-4" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </Button>
                            </form>
                        </TabsContent>
                        <TabsContent value="mobile" className="pt-4">
                            <form onSubmit={handleMobileLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile Number</Label>
                                    <Input
                                        id="mobile"
                                        type="tel"
                                        placeholder="e.g. 9876543210"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-4" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                    
                    <div className="my-6 flex items-center">
                        <div className="flex-grow border-t border-muted-foreground/20"></div>
                        <span className="mx-4 text-sm text-muted-foreground">OR</span>
                        <div className="flex-grow border-t border-muted-foreground/20"></div>
                    </div>

                    <Button variant="outline" className="w-full" onClick={handleGuestLogin} disabled={isLoading}>
                         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-4 w-4" />}
                         Continue as Guest
                    </Button>

                </CardContent>
                <CardFooter className="flex flex-col items-center text-sm">
                    <p className="text-muted-foreground">Don't have an account?</p>
                    <Button variant="link" className="p-0 h-auto text-accent hover:text-accent/80">
                        Sign up here
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
