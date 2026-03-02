"use client";

import { useState } from "react";
import ProjectSettings from "@/components/ProjectSettings";

export default function ProjectSettingsLauncher({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm"
      >
        設定
      </button>
      <ProjectSettings projectId={projectId} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}

