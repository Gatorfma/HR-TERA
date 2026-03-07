import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

type AuthMode = "login" | "signup";
type SignupStep = 1 | 2 | 3 | 4;

// Social buttons component - defined outside to avoid re-creation
const SocialButtons = ({ onGoogle, onLinkedIn }: { onGoogle: () => void; onLinkedIn: () => void }) => (
  <div className="flex gap-3 justify-center mb-4">
    <button
      type="button"
      className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
      onClick={onGoogle}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    </button>
    <button
      type="button"
      className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
      onClick={onLinkedIn}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    </button>
  </div>
);

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // Auth mode state
  const [mode, setMode] = useState<AuthMode>(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [signupStep, setSignupStep] = useState<SignupStep>(1);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile info (step 2)
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");

  // Animation direction for step transitions and mode switching
  const [stepDirection, setStepDirection] = useState<"forward" | "backward">("forward");
  const [modeDirection, setModeDirection] = useState<"forward" | "backward">("forward");

  // Survey (step 3)
  const [hrInvestmentPlanned, setHrInvestmentPlanned] = useState<boolean | null>(null);
  const [hrInvestmentArea, setHrInvestmentArea] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get("redirect") || "/";
      navigate(redirect);
    }
  }, [isAuthenticated, navigate, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(t("auth.missingFields"));
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);
      toast.success(t("auth.welcome"));
      const redirect = searchParams.get("redirect") || (user.isAdmin ? "/admin" : "/profile");
      navigate(redirect);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupStep1 = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(t("auth.missingFields"));
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setStepDirection("forward");
    setSignupStep(2);
  };

  const handleSignupStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setStepDirection("forward");
    setSignupStep(3);
  };

  const handleSignupStep3 = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      await signup(
        email,
        password,
        undefined, // fullName - we're not collecting this anymore
        company || undefined,
        position || undefined,
        phone || undefined,
        hrInvestmentPlanned ?? undefined,
        hrInvestmentArea || undefined
      );
      setStepDirection("forward");
      setSignupStep(4);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    // Set direction based on which mode we're switching to
    setModeDirection(newMode === "signup" ? "forward" : "backward");
    setMode(newMode);
    setSignupStep(1);
    setStepDirection("forward");
    // Reset form
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setCompany("");
    setPosition("");
    setPhone("");
    setHrInvestmentPlanned(null);
    setHrInvestmentArea("");
  };

  const goBackToStep = (step: SignupStep) => {
    setStepDirection("backward");
    setSignupStep(step);
  };

  const handleGoogleClick = () => toast.info("Google login coming soon");
  const handleLinkedInClick = () => toast.info("LinkedIn login coming soon");

  // Render the branded panel (gradient side) - no inputs, safe as inner function
  const renderBrandedPanel = (forSignup: boolean) => (
    <div className="flex flex-col items-center justify-center text-center text-white p-8 lg:p-12">
      <Link to="/" className="flex items-center gap-2 mb-6">
        <img
          src={`${import.meta.env.BASE_URL}hrtera-nobg-icon.png`}
          alt="HRTera logo"
          className="w-10 h-10 object-contain"
        />
        <span className="font-heading font-bold text-3xl">HRTera</span>
      </Link>
      <h2 className="text-2xl lg:text-3xl font-heading font-bold mb-4">
        {forSignup ? t("authPage.welcomeBack") : t("authPage.helloFriend")}
      </h2>
      <p className="text-white/80 mb-8 max-w-xs">
        {forSignup ? t("authPage.welcomeBackDesc") : t("authPage.helloFriendDesc")}
      </p>
      <Button
        variant="outline"
        onClick={() => switchMode(forSignup ? "login" : "signup")}
        className="rounded-full border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary px-8"
      >
        {forSignup ? t("authPage.signIn") : t("authPage.signUp")}
      </Button>
    </div>
  );

  // Login form JSX
  const loginFormContent = (
    <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm">
      <h1 className="text-2xl font-heading font-bold text-center text-foreground mb-2">
        {t("authPage.signIn")}
      </h1>

      <SocialButtons onGoogle={handleGoogleClick} onLinkedIn={handleLinkedInClick} />

      <p className="text-xs text-muted-foreground text-center">{t("authPage.orUseEmail")}</p>

      <div className="space-y-3">
        <Input
          type="email"
          placeholder={t("auth.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-lg bg-muted/50 border border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={t("auth.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-lg bg-muted/50 border border-border pr-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <a href="#" className="block text-sm text-muted-foreground hover:text-primary text-center">
        {t("auth.forgotPassword")}
      </a>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t("auth.loggingIn")}
          </>
        ) : (
          t("authPage.signIn")
        )}
      </Button>
    </form>
  );

  // Signup Step 1 JSX
  const signupStep1Content = (
    <form onSubmit={handleSignupStep1} className="space-y-4 w-full max-w-sm">
      <h1 className="text-2xl font-heading font-bold text-center text-foreground mb-2">
        {t("authPage.signUp")}
      </h1>

      <SocialButtons onGoogle={handleGoogleClick} onLinkedIn={handleLinkedInClick} />

      <p className="text-xs text-muted-foreground text-center">{t("authPage.orUseEmailSignup")}</p>

      <div className="space-y-3">
        <Input
          type="email"
          placeholder={t("auth.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-lg bg-muted/50 border border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={t("auth.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-lg bg-muted/50 border border-border pr-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("auth.confirmPassword")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-11 rounded-lg bg-muted/50 border border-border pr-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
      >
        {t("authPage.next")}
      </Button>
    </form>
  );

  // Signup Step 2 JSX
  const signupStep2Content = (
    <form onSubmit={handleSignupStep2} className="space-y-4 w-full max-w-sm">
      <button
        type="button"
        onClick={() => goBackToStep(1)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("authPage.back")}
      </button>

      <h1 className="text-2xl font-heading font-bold text-center text-foreground mb-2">
        {t("authPage.step2Title")}
      </h1>

      <p className="text-xs text-muted-foreground text-center mb-4">{t("authPage.allFieldsOptional")}</p>

      <div className="space-y-3">
        <div>
          <Label className="text-sm text-muted-foreground">{t("auth.company")}</Label>
          <Input
            type="text"
            placeholder="Acme Inc."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="h-11 rounded-lg bg-muted/50 border border-border mt-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">{t("authPage.position")}</Label>
          <Input
            type="text"
            placeholder="HR Manager"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="h-11 rounded-lg bg-muted/50 border border-border mt-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">{t("auth.phone")}</Label>
          <Input
            type="tel"
            placeholder="+90 555 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11 rounded-lg bg-muted/50 border border-border mt-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
      >
        {t("authPage.next")}
      </Button>
    </form>
  );

  // Signup Step 3 JSX
  const signupStep3Content = (
    <form onSubmit={handleSignupStep3} className="space-y-4 w-full max-w-sm">
      <button
        type="button"
        onClick={() => goBackToStep(2)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("authPage.back")}
      </button>

      <h1 className="text-2xl font-heading font-bold text-center text-foreground mb-4">
        {t("authPage.step3Title")}
      </h1>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-foreground mb-3">{t("authPage.surveyQ1")}</p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={hrInvestmentPlanned === true ? "default" : "outline"}
              onClick={() => setHrInvestmentPlanned(true)}
              className="flex-1 rounded-full"
            >
              {t("authPage.surveyYes")}
            </Button>
            <Button
              type="button"
              variant={hrInvestmentPlanned === false ? "default" : "outline"}
              onClick={() => setHrInvestmentPlanned(false)}
              className="flex-1 rounded-full"
            >
              {t("authPage.surveyNo")}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {hrInvestmentPlanned === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className="text-sm text-foreground mb-2">{t("authPage.surveyQ2")}</p>
              <Input
                type="text"
                placeholder={t("authPage.surveyQ2Placeholder")}
                value={hrInvestmentArea}
                onChange={(e) => setHrInvestmentArea(e.target.value)}
                className="h-11 rounded-lg bg-muted/50 border border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        type="submit"
        disabled={isLoading || hrInvestmentPlanned === null || (hrInvestmentPlanned === true && !hrInvestmentArea.trim())}
        className="w-full h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t("auth.creatingAccount")}
          </>
        ) : (
          t("authPage.signUp")
        )}
      </Button>
    </form>
  );

  // Verification message JSX
  const verificationContent = (
    <div className="text-center w-full max-w-sm">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
        {t("authPage.verifyTitle")}
      </h1>
      <p className="text-muted-foreground mb-8">{t("authPage.verifyDesc")}</p>
      <Button
        onClick={() => navigate("/")}
        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8"
      >
        {t("authPage.backToHome")}
      </Button>
    </div>
  );

  // Animation variants for step transitions
  const stepVariants = {
    enter: (direction: "forward" | "backward") => ({
      x: direction === "forward" ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "forward" | "backward") => ({
      x: direction === "forward" ? -50 : 50,
      opacity: 0,
    }),
  };

  // Get current step content
  const getStepContent = () => {
    switch (signupStep) {
      case 1:
        return signupStep1Content;
      case 2:
        return signupStep2Content;
      case 3:
        return signupStep3Content;
      case 4:
        return verificationContent;
    }
  };

  // Render current signup step content with animation
  const renderSignupContent = () => (
    <AnimatePresence mode="wait" custom={stepDirection}>
      <motion.div
        key={signupStep}
        custom={stepDirection}
        variants={stepVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="w-full flex justify-center"
      >
        {getStepContent()}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-muted/30 desktop:flex desktop:items-center desktop:justify-center desktop:p-4"
    >
      {/* Mobile Layout - Full Page */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="desktop:hidden min-h-screen flex flex-col"
      >
        {/* Mobile Header */}
        <div
          className="p-8 pt-12 text-center"
          style={{
            background: "linear-gradient(135deg, hsl(36 95% 55%) 0%, hsl(36 95% 45%) 100%)",
          }}
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <img
              src={`${import.meta.env.BASE_URL}hrtera-nobg-icon.png`}
              alt="HRTera logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-heading font-bold text-2xl text-white">HRTera</span>
          </Link>
          <p className="text-white/80 text-sm">{t("hero.badge")}</p>
        </div>

        {/* Mobile Tabs - Only show on login or signup step 1 */}
        {(mode === "login" || signupStep === 1) && (
          <div className="bg-card border-b border-border">
            <div className="flex">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                  mode === "login"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("authPage.signIn")}
                {mode === "login" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                  mode === "signup"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("authPage.signUp")}
                {mode === "signup" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Mobile Form - Full Width */}
        <div className="flex-1 bg-card p-6 flex flex-col items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait" custom={modeDirection}>
            <motion.div
              key={mode}
              custom={modeDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full flex justify-center"
            >
              {mode === "login" ? loginFormContent : renderSignupContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Desktop Layout with Flip Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`hidden desktop:block relative w-full max-w-4xl h-[600px] rounded-3xl shadow-2xl overflow-hidden ${
          mode === "signup" ? "signup-active" : ""
        }`}
      >
        {/* Back button - inside card, top left, color changes based on mode */}
        <button
          type="button"
          onClick={() => navigate(searchParams.get("redirect") || "/")}
          className={`absolute top-6 left-6 z-30 p-2 rounded-full transition-colors ${
            mode === "signup"
              ? "text-white/80 hover:text-white hover:bg-white/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {/* Form Container - Only render active form */}
        <div
          className={`absolute inset-y-0 w-1/2 bg-card flex items-center justify-center p-8 transition-transform duration-500 ease-in-out ${
            mode === "signup" ? "translate-x-full" : "translate-x-0"
          }`}
          style={{ left: 0 }}
        >
          {mode === "login" ? loginFormContent : renderSignupContent()}
        </div>

        {/* Overlay Container (Branded Panel) */}
        <div
          className={`absolute inset-y-0 w-1/2 overflow-hidden transition-transform duration-500 ease-in-out z-20 ${
            mode === "signup" ? "-translate-x-full" : "translate-x-0"
          }`}
          style={{ left: "50%" }}
        >
          <div
            className="relative h-full w-[200%] -left-full transition-transform duration-500 ease-in-out flex"
            style={{
              background: "linear-gradient(135deg, hsl(36 95% 55%) 0%, hsl(36 95% 45%) 100%)",
              transform: mode === "signup" ? "translateX(50%)" : "translateX(0)",
            }}
          >
            {/* Left panel (shows when signup is active) */}
            <div className="w-1/2 h-full flex items-center justify-center">
              {renderBrandedPanel(true)}
            </div>
            {/* Right panel (shows when login is active) */}
            <div className="w-1/2 h-full flex items-center justify-center">
              {renderBrandedPanel(false)}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Auth;
