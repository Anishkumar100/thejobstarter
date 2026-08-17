import AdminPlanList from './AdminPlanList.jsx';

/*
 * FacultyPlans — Reuses the shared AdminPlanList table with apiScope="faculty".
 * All data fetching, links, and the assign-plan modal switch to the
 * faculty endpoints automatically; admin/coordinator behavior is untouched.
 */
export default function FacultyPlans() {
  return <AdminPlanList apiScope="faculty" />;
}