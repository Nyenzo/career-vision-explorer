import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Layout from "@/components/layout/Layout";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function AccountManagement() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword.trim()) {
            toast.error("Please enter your current password.");
            return;
        }

        if (!passwordRegex.test(newPassword)) {
            toast.error("New password must be at least 8 characters and include uppercase, lowercase, and a number.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New password and confirmation do not match.");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const response = await authService.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
            });
            toast.success(response.message || "Password updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error?.message || "Failed to update password.");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword.trim()) {
            toast.error("Please enter your password to confirm account deletion.");
            return;
        }

        if (deleteConfirmation !== "DELETE") {
            toast.error("Please type DELETE to confirm permanent account deletion.");
            return;
        }

        setIsDeletingAccount(true);
        try {
            const response = await authService.deleteAccount({
                current_password: deletePassword,
            });
            toast.success(response.message || "Account deleted successfully.");
            await logout();
            navigate("/", { replace: true });
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete account.");
        } finally {
            setIsDeletingAccount(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-background py-8 px-4">
                <div className="max-w-3xl mx-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Management</CardTitle>
                            <CardDescription>
                                Manage your password and account lifecycle settings for {user?.email || "your account"}.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your password to keep your account secure.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <Button onClick={handleChangePassword} disabled={isUpdatingPassword}>
                                {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Password
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-600">Delete Account</CardTitle>
                            <CardDescription>
                                Permanently delete your account and associated data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Danger Zone</AlertTitle>
                                <AlertDescription>
                                    This action cannot be undone. You will lose access to your profile and history.
                                </AlertDescription>
                            </Alert>
                            <div className="space-y-2">
                                <Label htmlFor="delete-password">Current Password</Label>
                                <Input
                                    id="delete-password"
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="delete-confirmation">Type DELETE to confirm</Label>
                                <Input
                                    id="delete-confirmation"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder="DELETE"
                                />
                            </div>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={isDeletingAccount}
                            >
                                {isDeletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Delete Account Permanently
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
