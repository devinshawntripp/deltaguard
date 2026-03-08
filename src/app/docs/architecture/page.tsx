import type { Metadata } from "next";
import ArchitectureContent from "./ArchitectureContent";

export const metadata: Metadata = {
  title: "Architecture — ScanRook",
  description:
    "System architecture of the ScanRook vulnerability scanning platform. Covers cluster topology, scan pipeline, registry flow, and network layout.",
};

export default function ArchitecturePage() {
  return <ArchitectureContent />;
}
