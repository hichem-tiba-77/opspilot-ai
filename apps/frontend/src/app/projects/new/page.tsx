import { NewProjectForm } from "@/components/forms/NewProjectForm";
import { PageShell } from "@/components/PageShell";

export default function NewProjectPage() {
  return (
    <PageShell
      backHref="/projects"
      backLabel="Back to projects"
      description="Add an application, API, service, or worker so OpsPilot AI can collect logs and track incidents."
      eyebrow="New Project"
      maxWidth="narrow"
      title="Add a monitored application"
    >
      <NewProjectForm />
    </PageShell>
  );
}
