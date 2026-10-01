import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postEventReport, getEventReport, updateEventReport, downloadEventReportPdf } from "../api";
import type { EventReportPayload } from "../api";
import { Spinner, ErrorMessage } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";

interface Props {
  clubId: string;
  eventId: string;
  onClose: () => void;
}

export function EventReportModal({ clubId, eventId, onClose }: Props) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"FORM" | "REVIEW">("FORM");
  const [formData, setFormData] = useState<EventReportPayload>({
    actualAttendeeCount: 0,
    topic: "",
    activities: "",
    objectives: "",
    outcomes: "",
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ["eventReport", clubId, eventId],
    queryFn: () => getEventReport(clubId, eventId),
    retry: false, // Don't retry if it doesn't exist (404)
  });

  const [generatedContent, setGeneratedContent] = useState<any>(null);

  useEffect(() => {
    if (report) {
      setMode("REVIEW");
      setGeneratedContent(report.generatedContent);
    }
  }, [report]);

  const generateMutation = useMutation({
    mutationFn: (payload: EventReportPayload) => postEventReport(clubId, eventId, payload),
    onSuccess: (data) => {
      setGeneratedContent(data.generatedContent);
      setMode("REVIEW");
      queryClient.invalidateQueries({ queryKey: ["eventReport", clubId, eventId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateEventReport(clubId, eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventReport", clubId, eventId] });
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate(formData);
  };

  const handleUpdate = (status: "DRAFT" | "FINAL") => {
    updateMutation.mutate({ status, generatedContent });
  };

  const handleDownload = async () => {
    try {
      const response = await downloadEventReportPdf(clubId, eventId);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${eventId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download PDF", err);
    }
  };

  const inputClass = "w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-950 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">Post-Event Report</h2>

        {isLoading && <Spinner />}
        
        {!isLoading && mode === "FORM" && (
          <form onSubmit={handleGenerate} className="space-y-4">
            <label className="block text-sm">
              Actual Attendee Count *
              <input
                type="number"
                min="0"
                required
                value={formData.actualAttendeeCount}
                onChange={(e) => setFormData({ ...formData, actualAttendeeCount: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              Topic
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              Objectives
              <textarea
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                className={`${inputClass} min-h-20`}
              />
            </label>
            <label className="block text-sm">
              Activities / Experience
              <textarea
                value={formData.activities}
                onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                className={`${inputClass} min-h-20`}
              />
            </label>
            <label className="block text-sm">
              Outcomes
              <textarea
                value={formData.outcomes}
                onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
                className={`${inputClass} min-h-20`}
              />
            </label>
            {generateMutation.isError && <ErrorMessage message="Failed to generate report." />}
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={generateMutation.isPending}>
                {generateMutation.isPending ? "Generating..." : "Generate AI Draft"}
              </Button>
            </div>
          </form>
        )}

        {!isLoading && mode === "REVIEW" && generatedContent && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Executive Summary</label>
              <textarea
                value={generatedContent.executiveSummary || ""}
                onChange={(e) => setGeneratedContent({ ...generatedContent, executiveSummary: e.target.value })}
                className={`${inputClass} min-h-24`}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Objectives</label>
              <textarea
                value={generatedContent.objectives || ""}
                onChange={(e) => setGeneratedContent({ ...generatedContent, objectives: e.target.value })}
                className={`${inputClass} min-h-20`}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Activities</label>
              <textarea
                value={generatedContent.activities || ""}
                onChange={(e) => setGeneratedContent({ ...generatedContent, activities: e.target.value })}
                className={`${inputClass} min-h-20`}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Attendance Summary</label>
              <textarea
                value={generatedContent.attendanceSummary || ""}
                onChange={(e) => setGeneratedContent({ ...generatedContent, attendanceSummary: e.target.value })}
                className={`${inputClass} min-h-20`}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Outcomes</label>
              <textarea
                value={generatedContent.outcomes || ""}
                onChange={(e) => setGeneratedContent({ ...generatedContent, outcomes: e.target.value })}
                className={`${inputClass} min-h-20`}
              />
            </div>

            {updateMutation.isError && <ErrorMessage message="Failed to update report." />}
            {report?.status === "FINAL" && (
              <div className="bg-green-50 text-green-700 p-2 rounded-md text-sm mb-2">
                This report is marked as FINAL.
              </div>
            )}
            
            <div className="flex justify-between items-center mt-4">
              <Button type="button" onClick={() => setMode("FORM")}>Edit Inputs (Regenerate)</Button>
              
              <div className="flex gap-2">
                <Button type="button" onClick={() => handleUpdate("DRAFT")} disabled={updateMutation.isPending}>
                  Save Draft
                </Button>
                <Button type="button" variant="primary" onClick={() => handleUpdate("FINAL")} disabled={updateMutation.isPending}>
                  Finalize
                </Button>
                {(report?.status === "FINAL" || report) && (
                  <Button type="button" onClick={handleDownload} variant="primary">
                    Download PDF
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
