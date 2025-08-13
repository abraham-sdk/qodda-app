/**
 * User dashboard - protected route showing user's classification history
 */

import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { DashboardContent } from "@/src/components/dashboard/dashboard-content";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
