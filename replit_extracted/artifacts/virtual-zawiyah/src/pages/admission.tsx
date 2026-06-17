import { Layout, GeometricPattern } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubmitAdmission } from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";


const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Azerbaijan",
  "Bahrain","Bangladesh","Belgium","Bosnia","Brazil","Canada","China","Denmark",
  "Egypt","Ethiopia","Finland","France","Germany","Ghana","Greece","Hungary",
  "India","Indonesia","Iran","Iraq","Ireland","Italy","Japan","Jordan","Kazakhstan",
  "Kenya","Kuwait","Lebanon","Libya","Malaysia","Maldives","Mali","Mauritania",
  "Morocco","Netherlands","New Zealand","Nigeria","Norway","Oman","Pakistan",
  "Palestine","Philippines","Portugal","Qatar","Russia","Saudi Arabia","Senegal",
  "Singapore","Somalia","South Africa","Spain","Sri Lanka","Sudan","Sweden",
  "Switzerland","Syria","Tanzania","Tunisia","Turkey","Uganda","Ukraine",
  "United Arab Emirates","United Kingdom","United States","Uzbekistan","Yemen","Other"
];

const TIMEZONES = Intl.supportedValuesOf ? Intl.supportedValuesOf("timeZone") : [
  "America/New_York","America/Chicago","America/Denver","America/Los_Angeles",
  "America/Toronto","America/Vancouver","Europe/London","Europe/Paris","Europe/Berlin",
  "Asia/Dubai","Asia/Karachi","Asia/Kolkata","Asia/Dhaka","Asia/Kuala_Lumpur",
  "Asia/Singapore","Asia/Tokyo","Africa/Cairo","Africa/Lagos","Australia/Sydney",
  "Pacific/Auckland"
];

const COURSES = [
  "Quran Reading with Tajweed",
  "Applied Tajweed (Basic)",
  "Quran Memorization (Hifz)",
  "40 Hadith Memorization",
  "Quran Translation",
  "Arabic Grammar (Sarf & Nahw)",
  "Dars-e-Nizami",
  "Tajweed Group Program",
];

const COURSE_FORMAT: Record<string, "One-on-One" | "Group"> = {
  "Quran Reading with Tajweed":   "One-on-One",
  "Applied Tajweed (Basic)":      "One-on-One",
  "Quran Memorization (Hifz)":    "One-on-One",
  "40 Hadith Memorization":       "One-on-One",
  "Quran Translation":            "One-on-One",
  "Arabic Grammar (Sarf & Nahw)": "One-on-One",
  "Dars-e-Nizami":                "Group",
  "Tajweed Group Program":        "Group",
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const COUNTRY_DIAL_CODES: Record<string, string> = {
  "Afghanistan": "+93", "Albania": "+355", "Algeria": "+213", "Argentina": "+54",
  "Australia": "+61", "Austria": "+43", "Azerbaijan": "+994", "Bahrain": "+973",
  "Bangladesh": "+880", "Belgium": "+32", "Bosnia": "+387", "Brazil": "+55",
  "Canada": "+1", "China": "+86", "Denmark": "+45", "Egypt": "+20",
  "Ethiopia": "+251", "Finland": "+358", "France": "+33", "Germany": "+49",
  "Ghana": "+233", "Greece": "+30", "Hungary": "+36", "India": "+91",
  "Indonesia": "+62", "Iran": "+98", "Iraq": "+964", "Ireland": "+353",
  "Italy": "+39", "Japan": "+81", "Jordan": "+962", "Kazakhstan": "+7",
  "Kenya": "+254", "Kuwait": "+965", "Lebanon": "+961", "Libya": "+218",
  "Malaysia": "+60", "Maldives": "+960", "Mali": "+223", "Mauritania": "+222",
  "Morocco": "+212", "Netherlands": "+31", "New Zealand": "+64", "Nigeria": "+234",
  "Norway": "+47", "Oman": "+968", "Pakistan": "+92", "Palestine": "+970",
  "Philippines": "+63", "Portugal": "+351", "Qatar": "+974", "Russia": "+7",
  "Saudi Arabia": "+966", "Senegal": "+221", "Singapore": "+65", "Somalia": "+252",
  "South Africa": "+27", "Spain": "+34", "Sri Lanka": "+94", "Sudan": "+249",
  "Sweden": "+46", "Switzerland": "+41", "Syria": "+963", "Tanzania": "+255",
  "Tunisia": "+216", "Turkey": "+90", "Uganda": "+256", "Ukraine": "+380",
  "United Arab Emirates": "+971", "United Kingdom": "+44", "United States": "+1",
  "Uzbekistan": "+998", "Yemen": "+967", "Other": "",
};

function PhoneInput({
  dialCode,
  value,
  onChange,
  placeholder,
  id,
  "data-testid": testId,
}: {
  dialCode: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  "data-testid"?: string;
}) {
  const prefix = dialCode || "";
  const digitsOnly = value.startsWith(prefix)
    ? value.slice(prefix.length).replace(/\D/g, "")
    : value.replace(/\D/g, "");

  return (
    <div className="flex rounded-md overflow-hidden border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
      <div
        className="flex items-center justify-center px-3 border-r border-input text-sm font-semibold shrink-0 select-none"
        style={{ background: "#F4F4F5", color: "#1B6B3A", minWidth: "4.5rem" }}
      >
        {prefix || <span style={{ color: "#999" }}>+?</span>}
      </div>
      <input
        id={id}
        data-testid={testId}
        type="tel"
        inputMode="numeric"
        value={digitsOnly}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          onChange(prefix + digits);
        }}
        onKeyDown={(e) => {
          const allow = ["Backspace","Delete","Tab","ArrowLeft","ArrowRight","Home","End"];
          if (allow.includes(e.key)) return;
          if (!/^\d$/.test(e.key)) e.preventDefault();
        }}
        placeholder={placeholder || "Enter number"}
        className="flex-1 px-3 py-2 text-sm bg-transparent outline-none h-10"
      />
    </div>
  );
}

const schema = z.object({
  studentFullName: z.string().min(2, "Required"),
  fathersName: z.string().min(2, "Required"),
  guardianName: z.string().optional(),
  guardianRelationship: z.enum(["Father","Mother","Brother","Other"]),
  studentGender: z.enum(["Male","Female"]),
  studentAge: z.coerce.number().int().min(4, "Must be at least 4").max(100, "Invalid age"),
  country: z.string().min(1, "Required"),
  stateProvince: z.string().min(1, "Required"),
  guardianWhatsapp: z.string().min(5, "Required"),
  studentWhatsapp: z.string().optional(),
  emailAddress: z.string().email("Invalid email").optional().or(z.literal("")),
  course: z.string().min(1, "Required"),
  darsENizamiYear: z.coerce.number().optional(),
  classFormat: z.enum(["One-on-One","Group"]),
  preferredDuration: z.string().optional(),
  preferredTeacherGender: z.enum(["Male","Female"]).optional(),
  currentLevel: z.string().optional(),
  preferredTime1: z.string().optional(),
  preferredTime2: z.string().optional(),
  timezone: z.string().min(1, "Required"),
  daysAvailable: z.array(z.string()).min(1, "Select at least one day"),
  specialNeeds: z.string().optional(),
  additionalNotes: z.string().optional(),
  howDidYouHear: z.enum(["Social Media","Friend","Google","Other"]).optional(),
});

type FormData = z.infer<typeof schema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-lg shrink-0">
        {number}
      </div>
      <h2 className="font-serif font-bold text-2xl" style={{ color: "#1A1A1A" }}>{title}</h2>
    </div>
  );
}

export default function Admission() {
  const [submitted, setSubmitted] = useState(false);
  const submitAdmission = useSubmitAdmission();

  const { register, handleSubmit, control, watch, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      daysAvailable: [],
      timezone: Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : "",
    },
  });

  const watchCourse = watch("course");
  const watchFormat = watch("classFormat");
  const watchPlan = watch("preferredDuration");
  const watchCountry = watch("country");
  const isDarsNizami = watchCourse === "Dars-e-Nizami";
  const isOneOnOne = watchFormat === "One-on-One";
  const isGroup = watchFormat === "Group";
  const isWeekendPlan = watchPlan === "30min-weekend";
  const showDaysAvailable = isOneOnOne && !isWeekendPlan;
  const dialCode = COUNTRY_DIAL_CODES[watchCountry] ?? "";

  const ONE_ON_ONE_PLANS = [
    { value: "30min-3x-weekly", label: "30 min · 3 lessons/week", fee: "$60/month" },
    { value: "30min-5x-weekly", label: "30 min · 5 lessons/week", fee: "$100/month", popular: true },
    { value: "60min-3x-weekly", label: "60 min · 3 lessons/week", fee: "$120/month" },
    { value: "60min-5x-weekly", label: "60 min · 5 lessons/week", fee: "$200/month" },
    { value: "30min-weekend",   label: "30 min · Weekend (Sat & Sun)", fee: "$100/month" },
  ];

  const GROUP_PLANS = [
    { value: "120min-5x-weekly-group", label: "120 min · 5 lessons/week", fee: "$40/month" },
  ];

  // Auto-detect class format from selected course
  useEffect(() => {
    if (!watchCourse) return;
    const detectedFormat = COURSE_FORMAT[watchCourse];
    if (detectedFormat) {
      setValue("classFormat", detectedFormat);
      setValue("preferredDuration", undefined);
    }
  }, [watchCourse]);

  useEffect(() => {
    setValue("preferredDuration", undefined);
  }, [watchFormat]);

  // Auto-set days for fixed schedules; clear for manual selection
  useEffect(() => {
    if (isGroup) {
      setValue("daysAvailable", ["Monday","Tuesday","Wednesday","Thursday","Friday"]);
    } else if (isWeekendPlan) {
      setValue("daysAvailable", ["Saturday","Sunday"]);
    } else {
      setValue("daysAvailable", []);
    }
  }, [isGroup, isWeekendPlan]);

  useEffect(() => {
    if (!dialCode) return;
    const gw = watch("guardianWhatsapp");
    const sw = watch("studentWhatsapp") || "";
    if (!gw || !gw.replace(/\D/g,"")) {
      setValue("guardianWhatsapp", dialCode);
    } else {
      const digits = gw.replace(/\D/g,"").replace(/^\d{0,4}/, "");
      setValue("guardianWhatsapp", dialCode + digits);
    }
    if (sw && sw.replace(/\D/g,"")) {
      const digits = sw.replace(/\D/g,"");
      setValue("studentWhatsapp", dialCode + digits);
    } else if (!sw) {
      setValue("studentWhatsapp", dialCode);
    }
  }, [watchCountry, dialCode]);

  const onSubmit = (data: FormData) => {
    submitAdmission.mutate(
      {
        data: {
          studentFullName: data.studentFullName,
          fathersName: data.fathersName,
          guardianName: data.guardianName || null,
          guardianRelationship: data.guardianRelationship,
          studentGender: data.studentGender,
          studentAge: data.studentAge,
          country: data.country,
          stateProvince: data.stateProvince,
          guardianWhatsapp: data.guardianWhatsapp,
          studentWhatsapp: data.studentWhatsapp || null,
          emailAddress: data.emailAddress || null,
          course: data.course,
          darsENizamiYear: data.darsENizamiYear || null,
          classFormat: data.classFormat,
          preferredDuration: (data.preferredDuration || null) as import("@workspace/api-client-react").AdmissionInputPreferredDuration | undefined,
          preferredTeacherGender: (data.preferredTeacherGender ?? "Male") as "Male" | "Female",
          currentLevel: data.currentLevel || null,
          preferredTime1: data.preferredTime1 || null,
          preferredTime2: data.preferredTime2 || null,
          timezone: data.timezone,
          daysAvailable: data.daysAvailable,
          specialNeeds: data.specialNeeds || null,
          additionalNotes: data.additionalNotes || null,
          howDidYouHear: data.howDidYouHear || null,
        },
      },
      {
        onSuccess: () => setSubmitted(true),
      }
    );
  };

  if (submitted) {
    return (
      <Layout>
        <section className="min-h-[80vh] flex items-center justify-center py-20" style={{ background: "#E8F5EE" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg w-full mx-auto text-center px-4"
            data-testid="success-message"
          >
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="font-serif font-bold text-3xl mb-4" style={{ color: "#1A1A1A" }}>Application Received!</h2>
            <p className="text-lg leading-relaxed mb-6" style={{ color: "#444" }}>
              Your application has been received. Our team will contact you within 24 hours via WhatsApp to discuss your enrollment.
            </p>
            <p className="text-sm mb-8" style={{ color: "#666" }}>Jazakallah khair for choosing Virtual Zawiyah. May Allah bless your learning journey.</p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
              <Link href="/">Return to Home</Link>
            </Button>
          </motion.div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden py-16" style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 100%)" }}>
        <GeometricPattern opacity={0.07} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <nav className="text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">Admission</span>
            </nav>
            <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4" style={{ color: "#1A1A1A" }}>Admission Application</h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#666666" }}>
              Fill out the form below to apply. Our team will review your application and contact you within 24 hours via WhatsApp.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-14" noValidate>

            {/* Section 1: Personal Info */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="rounded-2xl border p-8 md:p-10" style={{ borderColor: "rgba(27,107,58,0.15)" }}>
              <SectionHeader number="1" title="Personal Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-1.5">
                  <Label htmlFor="studentFullName">Student Full Name <span className="text-destructive">*</span></Label>
                  <Input id="studentFullName" data-testid="input-student-name" {...register("studentFullName")} placeholder="e.g. Muhammad Abdullah" />
                  <FieldError message={errors.studentFullName?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fathersName">Father's Name <span className="text-destructive">*</span></Label>
                  <Input id="fathersName" data-testid="input-fathers-name" {...register("fathersName")} placeholder="Father's full name" />
                  <FieldError message={errors.fathersName?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="guardianName">Guardian Name <span className="text-muted-foreground text-xs">(if different from father)</span></Label>
                  <Input id="guardianName" data-testid="input-guardian-name" {...register("guardianName")} placeholder="Guardian's name" />
                </div>

                <div className="space-y-1.5">
                  <Label>Guardian Relationship <span className="text-destructive">*</span></Label>
                  <Controller name="guardianRelationship" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger data-testid="select-guardian-relationship">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Father","Mother","Brother","Other"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                  <FieldError message={errors.guardianRelationship?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label>Student Gender <span className="text-destructive">*</span></Label>
                  <Controller name="studentGender" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger data-testid="select-student-gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                  <FieldError message={errors.studentGender?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="studentAge">Student Age <span className="text-destructive">*</span></Label>
                  <Input id="studentAge" type="number" data-testid="input-student-age" {...register("studentAge")} placeholder="Age in years" min={4} max={100} />
                  <FieldError message={errors.studentAge?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label>Country <span className="text-destructive">*</span></Label>
                  <Controller name="country" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger data-testid="select-country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                  <FieldError message={errors.country?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="stateProvince">State / Province <span className="text-destructive">*</span></Label>
                  <Input id="stateProvince" data-testid="input-state" {...register("stateProvince")} placeholder="e.g. Ontario, Punjab, Texas" />
                  <FieldError message={errors.stateProvince?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="guardianWhatsapp">Guardian WhatsApp Number <span className="text-destructive">*</span></Label>
                  <Controller name="guardianWhatsapp" control={control} render={({ field }) => (
                    <PhoneInput
                      id="guardianWhatsapp"
                      data-testid="input-guardian-whatsapp"
                      dialCode={dialCode}
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="555 000 0000"
                    />
                  )} />
                  <FieldError message={errors.guardianWhatsapp?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="studentWhatsapp">Student WhatsApp Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Controller name="studentWhatsapp" control={control} render={({ field }) => (
                    <PhoneInput
                      id="studentWhatsapp"
                      data-testid="input-student-whatsapp"
                      dialCode={dialCode}
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="555 000 0000"
                    />
                  )} />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="emailAddress">Email Address <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input id="emailAddress" type="email" data-testid="input-email" {...register("emailAddress")} placeholder="your@email.com" />
                  <FieldError message={errors.emailAddress?.message} />
                </div>
              </div>
            </motion.div>

            {/* Section 2: Academic Info */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="rounded-2xl border p-8 md:p-10" style={{ borderColor: "rgba(27,107,58,0.15)" }}>
              <SectionHeader number="2" title="Academic Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-1.5">
                  <Label>Course <span className="text-destructive">*</span></Label>
                  <Controller name="course" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger data-testid="select-course">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {COURSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                  <FieldError message={errors.course?.message} />
                </div>

                {isDarsNizami && (
                  <div className="space-y-1.5">
                    <Label>Dars-e-Nizami Year <span className="text-destructive">*</span></Label>
                    <Controller name="darsENizamiYear" control={control} render={({ field }) => (
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                        <SelectTrigger data-testid="select-dn-year">
                          <SelectValue placeholder="Select year (1–8)" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8].map(y => <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )} />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Class Format</Label>
                  {watchFormat ? (
                    <div
                      className="flex items-center gap-2 h-10 px-4 rounded-md border text-sm font-medium"
                      style={{
                        borderColor: "rgba(27,107,58,0.25)",
                        background: watchFormat === "Group" ? "rgba(59,130,246,0.06)" : "rgba(27,107,58,0.06)",
                        color: watchFormat === "Group" ? "#1d4ed8" : "#1B6B3A",
                      }}
                      data-testid="class-format-display"
                    >
                      <span>{watchFormat === "Group" ? "🧑‍🤝‍🧑" : "👤"}</span>
                      <span>{watchFormat}</span>
                      <span className="ml-auto text-xs font-normal opacity-60">Auto-detected from course</span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center h-10 px-4 rounded-md border text-sm"
                      style={{ borderColor: "rgba(0,0,0,0.12)", color: "#aaa" }}
                    >
                      Select a course above to auto-detect
                    </div>
                  )}
                  <FieldError message={errors.classFormat?.message} />
                </div>

                {(isOneOnOne || isGroup) && (
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>
                      Lesson Plan / Duration{" "}
                      <span className="text-muted-foreground text-xs">(select your preferred plan)</span>
                    </Label>
                    <Controller name="preferredDuration" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <SelectTrigger data-testid="select-duration">
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {(isOneOnOne ? ONE_ON_ONE_PLANS : GROUP_PLANS).map((plan) => (
                            <SelectItem key={plan.value} value={plan.value}>
                              <span className="flex items-center justify-between w-full gap-4">
                                <span>{plan.label}</span>
                                <span className="font-semibold" style={{ color: "#1B6B3A" }}>
                                  {"popular" in plan && plan.popular ? "⭐ " : ""}{plan.fee}
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )} />
                    <p className="text-xs" style={{ color: "#999" }}>
                      Full pricing details on our{" "}
                      <a href="/fees" className="underline" style={{ color: "#1B6B3A" }}>Tuition & Fees</a> page.
                    </p>
                  </div>
                )}

                {isOneOnOne && (
                  <div className="space-y-1.5">
                    <Label>Preferred Teacher Gender <span className="text-destructive">*</span></Label>
                    <Controller name="preferredTeacherGender" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <SelectTrigger data-testid="select-teacher-gender">
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male Teacher</SelectItem>
                          <SelectItem value="Female">Female Teacher</SelectItem>
                        </SelectContent>
                      </Select>
                    )} />
                    <FieldError message={errors.preferredTeacherGender?.message} />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="currentLevel">Current Level or Experience <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input id="currentLevel" data-testid="input-current-level" {...register("currentLevel")} placeholder="e.g. Complete beginner, Know Qaida, etc." />
                </div>

                {isOneOnOne && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="preferredTime1">Preferred Time — 1st Choice</Label>
                      <Input id="preferredTime1" type="time" data-testid="input-time1" {...register("preferredTime1")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="preferredTime2">Preferred Time — 2nd Choice <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Input id="preferredTime2" type="time" data-testid="input-time2" {...register("preferredTime2")} />
                    </div>
                  </>
                )}

                <div className="space-y-1.5 md:col-span-2">
                  <Label>Timezone <span className="text-destructive">*</span></Label>
                  <Controller name="timezone" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger data-testid="select-timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                  <FieldError message={errors.timezone?.message} />
                </div>

                {/* Days Available — hidden for Group (fixed 5 days) and Weekend plan (fixed Sat & Sun) */}
                {showDaysAvailable ? (
                  <div className="space-y-3 md:col-span-2">
                    <Label>Days Available <span className="text-destructive">*</span></Label>
                    <div className="flex flex-wrap gap-3">
                      <Controller name="daysAvailable" control={control} render={({ field }) => (
                        <>
                          {DAYS.map(day => (
                            <label key={day} className="flex items-center gap-2 cursor-pointer" data-testid={`checkbox-day-${day.toLowerCase()}`}>
                              <Checkbox
                                checked={field.value?.includes(day)}
                                onCheckedChange={(checked) => {
                                  const cur = field.value || [];
                                  field.onChange(checked ? [...cur, day] : cur.filter(d => d !== day));
                                }}
                              />
                              <span className="text-sm font-medium">{day}</span>
                            </label>
                          ))}
                        </>
                      )} />
                    </div>
                    <FieldError message={errors.daysAvailable?.message} />
                  </div>
                ) : (
                  isGroup || isWeekendPlan ? (
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Days Available</Label>
                      <p className="text-sm rounded-lg px-4 py-3 border" style={{ color: "#555", borderColor: "rgba(27,107,58,0.2)", background: "#F6FBF8" }}>
                        {isGroup
                          ? "Group classes run Monday – Friday (5 days/week). Schedule is fixed."
                          : "Weekend classes run Saturday & Sunday. Schedule is fixed."}
                      </p>
                    </div>
                  ) : null
                )}
              </div>
            </motion.div>

            {/* Section 3: Additional */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="rounded-2xl border p-8 md:p-10" style={{ borderColor: "rgba(27,107,58,0.15)" }}>
              <SectionHeader number="3" title="Additional Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="specialNeeds">Special Needs or Disabilities <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Textarea id="specialNeeds" data-testid="textarea-special-needs" {...register("specialNeeds")} placeholder="Please let us know so we can accommodate you appropriately." rows={3} />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="additionalNotes">Additional Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Textarea id="additionalNotes" data-testid="textarea-notes" {...register("additionalNotes")} placeholder="Anything else you'd like us to know?" rows={3} />
                </div>

                <div className="space-y-1.5">
                  <Label>How did you hear about us? <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Controller name="howDidYouHear" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger data-testid="select-referral">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Friend">Friend or Family</SelectItem>
                        <SelectItem value="Google">Google Search</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp} className="text-center pt-2 pb-8">
              {submitAdmission.isError && (
                <p className="text-destructive text-sm mb-4">Something went wrong. Please try again or contact us on WhatsApp.</p>
              )}
              <Button
                type="submit"
                size="lg"
                disabled={submitAdmission.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-12 h-14 text-base shadow-md w-full sm:w-auto"
                data-testid="btn-submit-admission"
              >
                {submitAdmission.isPending ? "Submitting..." : "Submit Application"}
                {!submitAdmission.isPending && <ChevronRight className="ml-2 w-5 h-5" />}
              </Button>
              <p className="text-sm mt-4" style={{ color: "#666" }}>We will contact you within 24 hours via WhatsApp after reviewing your application.</p>
            </motion.div>
          </form>
        </div>
      </section>
    </Layout>
  );
}
