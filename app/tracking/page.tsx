import type { Metadata } from "next";
import TrackingClient from "./TrackingClient";

export const metadata: Metadata = {
  title: "Lacak Pesanan - Jahitsini.com",
  description:
    "Lacak status pesanan jahit dan permakmu di Jahitsini.com secara real-time.",
};

export default function TrackingPage() {
  return <TrackingClient />;
}
