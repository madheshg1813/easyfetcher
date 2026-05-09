export default function DataDeletionStatusPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Data Deletion Status</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your data deletion request has been received. We will process your request and remove all
          associated data within 30 days.
        </p>
        <p className="text-muted-foreground text-sm">
          For questions, contact{" "}
          <a href="mailto:privacy@easyfetcher.com" className="text-primary hover:underline">
            privacy@easyfetcher.com
          </a>
        </p>
      </div>
    </div>
  );
}
