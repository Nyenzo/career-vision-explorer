import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/hooks/use-auth";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout/Layout";
import { AlertTriangle, Bell, Loader2, Mail, Shield } from "lucide-react";
import { toast } from "sonner";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function AccountManagement() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { preferences, isLoading: prefsLoading, isSaving: prefsSaving, updatePreferences } =
        useNotificationPreferences();

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

    const handlePrefToggle = async (key: keyof typeof preferences, value: boolean) => {
        if (!preferences) return;
        try {
            await updatePreferences({ [key]: value });
        } catch {
            toast.error("Failed to save preference.");
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 py-10 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* ── Left Column ── */}
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
                                <p className="mt-2 text-sm text-gray-500">
                                    Configure your security preferences, manage notifications, and control your digital footprint at Atelier.
                                </p>
                            </div>

                            {/* Primary Email card */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="pt-5 pb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                                            <Mail className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Primary Email
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {user?.email || "—"}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ── Right Column ── */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Notification Preferences */}
                            <Card className="shadow-sm border-gray-200">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-indigo-600" />
                                        <CardTitle className="text-base">Notification Preferences</CardTitle>
                                    </div>
                                    <CardDescription>Choose what you'd like to be notified about.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {prefsLoading ? (
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Loading preferences…
                                        </div>
                                    ) : (
                                        <>
                                            {/* Email notifications section */}
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                                                    Email Notifications
                                                </p>
                                                <div className="space-y-4">
                                                    {[
                                                        {
                                                            key: "job_alerts" as const,
                                                            label: "Job Matches",
                                                            description: "Get notified when new roles match your profile",
                                                        },
                                                        {
                                                            key: "application_updates" as const,
                                                            label: "Application Updates",
                                                            description: "Real-time status changes for your active applications",
                                                        },
                                                        {
                                                            key: "system_notifications" as const,
                                                            label: "System Messages",
                                                            description: "Important updates regarding platform features",
                                                        },
                                                    ].map(({ key, label, description }) => (
                                                        <div key={key} className="flex items-center justify-between gap-4">
                                                            <div>
                                                                <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                                                                    {label}
                                                                </Label>
                                                                <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                                                            </div>
                                                            <Checkbox
                                                                id={key}
                                                                checked={preferences?.[key] ?? true}
                                                                disabled={prefsSaving}
                                                                onCheckedChange={(checked) =>
                                                                    handlePrefToggle(key, checked === true)
                                                                }
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Push notifications section */}
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                                                    Push Notifications
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            Enable push notifications
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            Enable instant mobile and browser alerts
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={preferences?.email_notifications ?? true}
                                                        disabled={prefsSaving}
                                                        onCheckedChange={(checked) =>
                                                            handlePrefToggle("email_notifications", checked)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Security */}
                            <Card className="shadow-sm border-gray-200">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-indigo-600" />
                                        <CardTitle className="text-base">Security</CardTitle>
                                    </div>
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-password">New Password</Label>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="New password"
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
                                    </div>
                                    <Button onClick={handleChangePassword} disabled={isUpdatingPassword}>
                                        {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Update Password
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Danger Zone */}
                            <Card className="shadow-sm border border-dashed border-red-300">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base text-red-600 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> Danger Zone
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        Permanently deleting your account will remove all your data, including job matches, chat
                                        history, and portfolio links. This action cannot be undone.
                                    </p>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-1">
                                                Confirmation Required
                                            </p>
                                            <p className="text-xs text-gray-500">Type <strong>DELETE</strong> in the field below to confirm.</p>
                                        </div>
                                        <Input
                                            id="delete-confirmation"
                                            value={deleteConfirmation}
                                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                                            placeholder="DELETE"
                                            className="uppercase placeholder:normal-case"
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
                </div>
            </div>
        </Layout>
    );
}