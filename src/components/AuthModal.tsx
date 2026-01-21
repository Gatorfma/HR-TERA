import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import PhoneInput from "@/components/PhoneInput";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup, signInWithGoogle } = useAuth();
  const { t } = useLanguage();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  const isValidPhone = (value: string) => /^\+\d{7,15}$/.test(value);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    setIsLoading(true);
    try {
      const loggedInUser = await login(email, password);
      toast.success("Welcome back!");
      onOpenChange(false);
      
      // Redirect admins to admin panel, others to profile
      if (loggedInUser.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google sign-in failed. Please try again.";
      toast.error(message);
      setIsGoogleLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !password || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    const normalizedPhone = phone.trim();
    if (!isValidPhone(normalizedPhone)) {
      toast.error(t("auth.invalidPhone"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password, fullName, company, role, normalizedPhone);
      toast.success("Account created successfully! Please check your email to verify.");
      onOpenChange(false);
      navigate("/profile");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-background/80 backdrop-blur-md" />
        <DialogContent className="max-w-[540px] max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
          {/* Visually hidden title for screen readers */}
          <VisuallyHidden>
            <DialogTitle>
              {activeTab === "login" ? "Login to HRTera" : "Sign up for HRTera"}
            </DialogTitle>
          </VisuallyHidden>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full bg-card rounded-3xl shadow-xl border border-border p-8 md:p-10 relative"
          >

            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex gap-0.5">
                <div className="w-3 h-6 bg-primary rounded-full rotate-12" />
                <div className="w-3 h-6 bg-primary rounded-full -rotate-12" />
              </div>
              <span className="font-heading font-bold text-2xl text-foreground">HRTera</span>
            </div>

            {/* Welcome text */}
            <p className="text-center text-muted-foreground mb-8">
              {t("auth.welcome")}
            </p>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 p-1 bg-muted rounded-full">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === "login"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("auth.login")}
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === "signup"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("auth.signup")}
              </button>
            </div>

            {/* Form Content */}
            <AnimatePresence mode="wait">
              {activeTab === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                  onSubmit={handleLogin}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t("auth.password")}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 rounded-xl pr-12 focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="remember" className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                      <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                        {t("auth.rememberMe")}
                      </Label>
                    </div>
                    <a href="#" className="text-sm text-primary hover:underline">
                      {t("auth.forgotPassword")}
                    </a>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t("auth.loggingIn")}
                      </>
                    ) : (
                      t("auth.login")
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    {t("auth.noAccount")}{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("signup")}
                      className="text-primary font-medium hover:underline"
                    >
                      {t("auth.signup")}
                    </button>
                  </p>

                  {/* Social Auth Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground">{t("auth.orContinue")}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading || isGoogleLoading}
                    onClick={handleGoogleSignIn}
                    className="w-full h-12 rounded-xl border-border bg-background text-foreground hover:bg-muted"
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t("auth.continueWithGoogle")}
                      </>
                    ) : (
                      <>
                        <svg aria-hidden="true" viewBox="0 0 48 48">
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.9-6.9C35.9 2.3 30.4 0 24 0 14.6 0 6.4 5.4 2.6 13.3l8.1 6.3C12.8 13.7 18 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v7.7h12.7c-.3 2-1.9 5-5.5 7l8.5 6.6c4.9-4.6 7.8-11.3 7.8-19.2z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.7 28.2c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-8.1-6.3C.9 15.4 0 19.6 0 23.5s.9 8.1 2.6 11.3l8.1-6.6z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.4 0 11.8-2.1 15.7-5.8l-8.5-6.6c-2.3 1.6-5.3 2.6-7.2 2.6-6 0-11.2-4.2-13.1-10l-8.1 6.6C6.4 42.6 14.6 48 24 48z"
                          />
                        </svg>
                        {t("auth.continueWithGoogle")}
                      </>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                  onSubmit={handleSignup}
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workEmail">{t("auth.workEmail")}</Label>
                    <Input
                      id="workEmail"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("auth.phone")}</Label>
                    <PhoneInput
                      id="phone"
                      value={phone}
                      onChange={setPhone}
                      defaultCountry="TR"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">{t("auth.company")}</Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Acme Inc."
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="h-12 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">{t("auth.role")}</Label>
                      <Input
                        id="role"
                        type="text"
                        placeholder="HR Manager"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="h-12 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">{t("auth.password")}</Label>
                    <div className="relative">
                      <Input
                        id="signupPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 rounded-xl pr-12 focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 rounded-xl pr-12 focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox id="terms" className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer">
                      {t("auth.agreeTerms")}{" "}
                      <a href="#" className="text-primary hover:underline">{t("auth.termsOfService")}</a>
                      {" "}{t("auth.and")}{" "}
                      <a href="#" className="text-primary hover:underline">{t("auth.privacyPolicy")}</a>
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t("auth.creatingAccount")}
                      </>
                    ) : (
                      t("auth.createAccount")
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    {t("auth.hasAccount")}{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="text-primary font-medium hover:underline"
                    >
                      {t("auth.login")}
                    </button>
                  </p>

                  {/* Social Auth Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground">{t("auth.orContinue")}</span>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default AuthModal;
