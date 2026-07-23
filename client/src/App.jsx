import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useUser, useAuth } from '@clerk/clerk-react';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuthStore } from './stores/useAuthStore.js';
import { useLanguageStore } from './stores/useLanguageStore.js';
import { useThemeStore } from './stores/useThemeStore.js';
import { useScrollToTop } from './hooks/useScrollToTop.js';

import Navbar from './components/ui/Navbar.jsx';
import Footer from './components/ui/Footer.jsx';
import ToastContainer from './components/ui/Toast.jsx';
import PageLoader from './components/ui/PageLoader.jsx';

/* Public pages */
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import DsaList from './pages/DsaList.jsx';
import DsaLesson from './pages/DsaLesson.jsx';
import DsaSubtopic from './pages/DsaSubtopic.jsx';
import DsaSubtopicProblems from './pages/DsaSubtopicProblems.jsx';
import DsaDetail from './pages/DsaDetail.jsx';
import DbmsList from './pages/DbmsList.jsx';
import DbmsLesson from './pages/DbmsLesson.jsx';
import DbmsSubtopic from './pages/DbmsSubtopic.jsx';
import DbmsSubtopicProblems from './pages/DbmsSubtopicProblems.jsx';
import DbmsDetail from './pages/DbmsDetail.jsx';
import OsList from './pages/OsList.jsx';
import OsLesson from './pages/OsLesson.jsx';
import OsSubtopic from './pages/OsSubtopic.jsx';
import OsSubtopicProblems from './pages/OsSubtopicProblems.jsx';
import OsDetail from './pages/OsDetail.jsx';
import ProgrammingList from './pages/ProgrammingList.jsx';
import ProgrammingLesson from './pages/ProgrammingLesson.jsx';
import ProgrammingSubtopic from './pages/ProgrammingSubtopic.jsx';
import ProgrammingSubtopicProblems from './pages/ProgrammingSubtopicProblems.jsx';
import ProgrammingDetail from './pages/ProgrammingDetail.jsx';
import BlogList from './pages/BlogList.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import Cheatsheets from './pages/Cheatsheets.jsx';
import Newsletter from './pages/Newsletter.jsx';

/* Protected pages */
import SubjectProgressDetail from './pages/SubjectProgressDetail.jsx';
import QaList from './pages/QaList.jsx';
import QaDetail from './pages/QaDetail.jsx';
import AskQuestion from './pages/AskQuestion.jsx';
import UserSearchPage from './pages/UserSearchPage.jsx';
import UserProfile from './pages/UserProfile.jsx';
import FollowersPage from './pages/FollowersPage.jsx';
import EditProfile from './pages/EditProfile.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import MessageThreadPage from './pages/MessageThreadPage.jsx';

/* Auth pages */
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';

/* Admin pages */
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminDsaList from './pages/AdminDsaList.jsx';
import AdminHeroSection from './pages/AdminHeroSection.jsx';
import AdminHomepageConfig from './pages/AdminHomepageConfig.jsx';
import AdminDsaLessonEdit from './pages/AdminDsaLessonEdit.jsx';
import AdminSubtopicList from './pages/AdminSubtopicList.jsx';
import AdminAllSubtopics from './pages/AdminAllSubtopics.jsx';
import AdminSubtopicEdit from './pages/AdminSubtopicEdit.jsx';
import AdminDsaProblemList from './pages/AdminDsaProblemList.jsx';
import AdminDsaProblemEdit from './pages/AdminDsaProblemEdit.jsx';
import AdminDbmsList from './pages/AdminDbmsList.jsx';
import AdminDbmsLessonEdit from './pages/AdminDbmsLessonEdit.jsx';
import AdminDbmsSubtopicList from './pages/AdminDbmsSubtopicList.jsx';
import AdminDbmsAllSubtopics from './pages/AdminDbmsAllSubtopics.jsx';
import AdminDbmsSubtopicEdit from './pages/AdminDbmsSubtopicEdit.jsx';
import AdminDbmsProblemList from './pages/AdminDbmsProblemList.jsx';
import AdminDbmsProblemEdit from './pages/AdminDbmsProblemEdit.jsx';
import AdminDbmsMeta from './pages/AdminDbmsMeta.jsx';
import AdminOsList from './pages/AdminOsList.jsx';
import AdminOsLessonEdit from './pages/AdminOsLessonEdit.jsx';
import AdminOsSubtopicList from './pages/AdminOsSubtopicList.jsx';
import AdminOsAllSubtopics from './pages/AdminOsAllSubtopics.jsx';
import AdminOsSubtopicEdit from './pages/AdminOsSubtopicEdit.jsx';
import AdminOsProblemList from './pages/AdminOsProblemList.jsx';
import AdminOsProblemEdit from './pages/AdminOsProblemEdit.jsx';
import AdminOsMeta from './pages/AdminOsMeta.jsx';
import AdminProgrammingList from './pages/AdminProgrammingList.jsx';
import AdminProgrammingLessonEdit from './pages/AdminProgrammingLessonEdit.jsx';
import AdminProgrammingAllSubtopics from './pages/AdminProgrammingAllSubtopics.jsx';
import AdminProgrammingSubtopicList from './pages/AdminProgrammingSubtopicList.jsx';
import AdminProgrammingSubtopicEdit from './pages/AdminProgrammingSubtopicEdit.jsx';
import AdminProgrammingProblemList from './pages/AdminProgrammingProblemList.jsx';
import AdminProgrammingProblemEdit from './pages/AdminProgrammingProblemEdit.jsx';
import AdminProgrammingMeta from './pages/AdminProgrammingMeta.jsx';
import AdminBlogList from './pages/AdminBlogList.jsx';
import AdminBlogEdit from './pages/AdminBlogEdit.jsx';
import AdminMedia from './pages/AdminMedia.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminUserEdit from './pages/AdminUserEdit.jsx';
import AdminQA from './pages/AdminQA.jsx';
import AdminLanguagesList from './pages/AdminLanguagesList.jsx';
import AdminLanguageEdit from './pages/AdminLanguageEdit.jsx';
import AdminNewsletter from './pages/AdminNewsletter.jsx';
import AdminTopics from './pages/AdminTopics.jsx';
import AdminDsaMeta from './pages/AdminDsaMeta.jsx';
import AdminWhySection from './pages/AdminWhySection.jsx';
import AdminWhyTheJobStarter from './pages/AdminWhyTheJobStarter.jsx';
import AdminAboutPage from './pages/AdminAboutPage.jsx';
import AdminHowItWorks from './pages/AdminHowItWorks.jsx';
import AdminTestimonials from './pages/AdminTestimonials.jsx';
import AdminProgressMessages from './pages/AdminProgressMessages.jsx';
import AdminCoachingCenters from './pages/AdminCoachingCenters.jsx';
import AdminCoachingCenterDetail from './pages/AdminCoachingCenterDetail.jsx';
import AdminBatchDetail from './pages/AdminBatchDetail.jsx';
import AdminCoachingCenterStudentDetail from './pages/AdminCoachingCenterStudentDetail.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';

import CoordinatorDashboard from './pages/CoordinatorDashboard.jsx';
import CoordinatorGeneralStats from './pages/CoordinatorGeneralStats.jsx';
import CoordinatorBatches from './pages/CoordinatorBatches.jsx';
import CoordinatorBatchDetail from './pages/CoordinatorBatchDetail.jsx';
import CoordinatorCourses from './pages/CoordinatorCourses.jsx';
import CoordinatorStudentsList from './pages/CoordinatorStudentsList.jsx';
import CoordinatorStudentDetail from './pages/CoordinatorStudentDetail.jsx';
import CoordinatorProfile from './pages/CoordinatorProfile.jsx';
import CoordinatorLayout from './components/coordinator/CoordinatorLayout.jsx';
import AdminPlanList from './pages/AdminPlanList.jsx';
import AdminPlanBuilder from './pages/AdminPlanBuilder.jsx';
import NotFound from './pages/NotFound.jsx';

import './styles/tailwind.css';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/admin.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const HAS_CLERK = Boolean(clerkPubKey && clerkPubKey !== 'pk_test_xxx');

function ProtectedRoute({ children }) {
  if (!HAS_CLERK) return children;
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

function AdminRoute({ children }) {
  if (!HAS_CLERK) return children;
  const { user } = useUser();
  if (!user) return <RedirectToSignIn />;
  if (user?.publicMetadata?.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function CoordinatorRoute({ children }) {
  if (!HAS_CLERK) return children;
  const { user } = useUser();
  if (!user) return <RedirectToSignIn />;
  if (user?.publicMetadata?.role !== 'coordinator') return <Navigate to="/" />;
  return children;
}

function AuthSync() {
  const { setUser, updateUser, clearUser, user: authUser } = useAuthStore();
  const { user: clerkUser, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const username = clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress?.split('@')[0];
      setUser({
        id: clerkUser.id,
        username,
        displayName: clerkUser.fullName || clerkUser.username || 'User',
        avatar: clerkUser.imageUrl,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        publicMetadata: clerkUser.publicMetadata
      });
      /* Fetch server profile to get custom avatar and displayName */
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      (async () => {
        try {
          const token = await window.Clerk?.session?.getToken();
          if (!token) { return; }
          const res = await fetch(`${apiUrl}/users/${username}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          if (json.data) {
            const serverUpdates = {}; 
            /* Store the MongoDB _id for author comparisons (e.g. Accept button) */
            if (json.data._id) {
              serverUpdates._id = json.data._id;
            }
            if (json.data.avatar && json.data.avatar !== clerkUser.imageUrl) {
              serverUpdates.avatar = json.data.avatar;
            }
            if (json.data.displayName && json.data.displayName !== (clerkUser.fullName || clerkUser.username)) {
              serverUpdates.displayName = json.data.displayName;
            }
            if (Object.keys(serverUpdates).length > 0) {
              updateUser(serverUpdates);
            }
          }
        } catch (err) {
          console.error('[AUTH] Error fetching server profile:', err.message);
        }
      })();
    } else {
      clearUser();
    }
  }, [isSignedIn, clerkUser]);

  return null;
}

function InitLanguages() {
  const { fetchLanguages } = useLanguageStore();
  useEffect(() => { fetchLanguages(); }, []);
  return null;
}

function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {!HAS_CLERK && (
        <div style={{ background: 'var(--bg-inverse)', color: 'var(--text-inverse)', textAlign: 'center', padding: '8px', fontSize: '0.8rem' }}>
          Dev mode — add VITE_CLERK_PUBLISHABLE_KEY to client/.env for auth. Protected/admin routes are open.
        </div>
      )}
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ToastContainer />
      <PageLoader />
    </div>
  );
}

/* All routes in one place, no shell split */
function AppRoutes() {
  useScrollToTop();
  return (
    <Routes>
      <Route path="/" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/about" element={<AppLayout><About /></AppLayout>} />
      <Route path="/dsa" element={<ProtectedRoute><AppLayout><DsaList /></AppLayout></ProtectedRoute>} />
      <Route path="/dsa/:lessonSlug/:subtopicSlug/problems" element={<ProtectedRoute><AppLayout><DsaSubtopicProblems /></AppLayout></ProtectedRoute>} />
      <Route path="/dsa/:lessonSlug/:subtopicSlug/:problemSlug" element={<ProtectedRoute><AppLayout><DsaDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/dsa/:lessonSlug/:subtopicSlug" element={<ProtectedRoute><AppLayout><DsaSubtopic /></AppLayout></ProtectedRoute>} />
      <Route path="/dsa/:lessonSlug" element={<ProtectedRoute><AppLayout><DsaLesson /></AppLayout></ProtectedRoute>} />
      <Route path="/dbms" element={<ProtectedRoute><AppLayout><DbmsList /></AppLayout></ProtectedRoute>} />
      <Route path="/dbms/:lessonSlug/:subtopicSlug/problems" element={<ProtectedRoute><AppLayout><DbmsSubtopicProblems /></AppLayout></ProtectedRoute>} />
      <Route path="/dbms/:lessonSlug/:subtopicSlug/:problemSlug" element={<ProtectedRoute><AppLayout><DbmsDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/dbms/:lessonSlug/:subtopicSlug" element={<ProtectedRoute><AppLayout><DbmsSubtopic /></AppLayout></ProtectedRoute>} />
      <Route path="/dbms/:lessonSlug" element={<ProtectedRoute><AppLayout><DbmsLesson /></AppLayout></ProtectedRoute>} />
      <Route path="/os" element={<ProtectedRoute><AppLayout><OsList /></AppLayout></ProtectedRoute>} />
      <Route path="/os/:lessonSlug/:subtopicSlug/problems" element={<ProtectedRoute><AppLayout><OsSubtopicProblems /></AppLayout></ProtectedRoute>} />
      <Route path="/os/:lessonSlug/:subtopicSlug/:problemSlug" element={<ProtectedRoute><AppLayout><OsDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/os/:lessonSlug/:subtopicSlug" element={<ProtectedRoute><AppLayout><OsSubtopic /></AppLayout></ProtectedRoute>} />
      <Route path="/os/:lessonSlug" element={<ProtectedRoute><AppLayout><OsLesson /></AppLayout></ProtectedRoute>} />
      <Route path="/programming" element={<ProtectedRoute><AppLayout><ProgrammingList /></AppLayout></ProtectedRoute>} />
      <Route path="/programming/:lessonSlug/:subtopicSlug/problems" element={<ProtectedRoute><AppLayout><ProgrammingSubtopicProblems /></AppLayout></ProtectedRoute>} />
      <Route path="/programming/:lessonSlug/:subtopicSlug/:problemSlug" element={<ProtectedRoute><AppLayout><ProgrammingDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/programming/:lessonSlug/:subtopicSlug" element={<ProtectedRoute><AppLayout><ProgrammingSubtopic /></AppLayout></ProtectedRoute>} />
      <Route path="/programming/:lessonSlug" element={<ProtectedRoute><AppLayout><ProgrammingLesson /></AppLayout></ProtectedRoute>} />
      <Route path="/blog" element={<ProtectedRoute><AppLayout><BlogList /></AppLayout></ProtectedRoute>} />
      <Route path="/blog/:slug" element={<ProtectedRoute><AppLayout><BlogDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/cheatsheets" element={<AppLayout><Cheatsheets /></AppLayout>} />
      <Route path="/newsletter" element={<AppLayout><Newsletter /></AppLayout>} />
      <Route path="/sign-in/*" element={<SignIn />} />
      <Route path="/sign-up/*" element={<SignUp />} />

      <Route path="/qa" element={<ProtectedRoute><AppLayout><QaList /></AppLayout></ProtectedRoute>} />
      <Route path="/qa/:id" element={<ProtectedRoute><AppLayout><QaDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/qa/ask" element={<ProtectedRoute><AppLayout><AskQuestion /></AppLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><AppLayout><UserSearchPage /></AppLayout></ProtectedRoute>} />
      <Route path="/users/:username" element={<ProtectedRoute><AppLayout><UserProfile /></AppLayout></ProtectedRoute>} />
      <Route path="/users/:username/followers" element={<ProtectedRoute><AppLayout><FollowersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/settings/profile" element={<ProtectedRoute><AppLayout><EditProfile /></AppLayout></ProtectedRoute>} />
      <Route path="/settings/progress/:subject" element={<ProtectedRoute><AppLayout><SubjectProgressDetail /></AppLayout></ProtectedRoute>} />

      <Route path="/coordinator" element={<CoordinatorRoute><CoordinatorLayout><CoordinatorDashboard /></CoordinatorLayout></CoordinatorRoute>} />
      <Route path="/coordinator/general-stats" element={<CoordinatorRoute><CoordinatorLayout><CoordinatorGeneralStats /></CoordinatorLayout></CoordinatorRoute>} />
      <Route path="/coordinator/courses" element={<CoordinatorRoute><CoordinatorLayout><CoordinatorCourses /></CoordinatorLayout></CoordinatorRoute>} />
      <Route path="/coordinator/batches" element={<CoordinatorRoute><CoordinatorLayout><CoordinatorBatches /></CoordinatorLayout></CoordinatorRoute>} />
      <Route path="/coordinator/batches/:id" element={<CoordinatorRoute><CoordinatorLayout><CoordinatorBatchDetail /></CoordinatorLayout></CoordinatorRoute>} />
      <Route path="/coordinator/students" element={<CoordinatorRoute><CoordinatorLayout><CoordinatorStudentsList /></CoordinatorLayout></CoordinatorRoute>} />
      <Route path="/coordinator/students/:userId" element={<CoordinatorRoute><CoordinatorLayout><CoordinatorStudentDetail /></CoordinatorLayout></CoordinatorRoute>} />
      <Route path="/coordinator/profile" element={<CoordinatorRoute><CoordinatorLayout><CoordinatorProfile /></CoordinatorLayout></CoordinatorRoute>} />
      <Route path="/coordinator/plans" element={<CoordinatorRoute><CoordinatorLayout><AdminPlanList /></CoordinatorLayout></CoordinatorRoute>} />
      <Route path="/coordinator/plans/new" element={<CoordinatorRoute><CoordinatorLayout><AdminPlanBuilder /></CoordinatorLayout></CoordinatorRoute>} />
      <Route path="/coordinator/plans/:id" element={<CoordinatorRoute><CoordinatorLayout><AdminPlanBuilder /></CoordinatorLayout></CoordinatorRoute>} />
      <Route path="/coordinator/plans/:id/edit" element={<CoordinatorRoute><CoordinatorLayout><AdminPlanBuilder /></CoordinatorLayout></CoordinatorRoute>} />
      <Route path="/messages" element={<ProtectedRoute><AppLayout><MessagesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/messages/:userId" element={<ProtectedRoute><AppLayout><MessageThreadPage /></AppLayout></ProtectedRoute>} />

      <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dsa" element={<AdminRoute><AdminLayout><AdminDsaList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dsa/lessons" element={<AdminRoute><AdminLayout><AdminDsaList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dsa/lessons/new" element={<AdminRoute><AdminLayout><AdminDsaLessonEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dsa/lessons/:id/edit" element={<AdminRoute><AdminLayout><AdminDsaLessonEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dsa/subtopics" element={<AdminRoute><AdminLayout><AdminAllSubtopics /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dsa/lessons/:lessonId/subtopics" element={<AdminRoute><AdminLayout><AdminSubtopicList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dsa/lessons/:lessonId/subtopics/new" element={<AdminRoute><AdminLayout><AdminSubtopicEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dsa/lessons/:lessonId/subtopics/:id/edit" element={<AdminRoute><AdminLayout><AdminSubtopicEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dsa/problems" element={<AdminRoute><AdminLayout><AdminDsaProblemList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dsa/problems/new" element={<AdminRoute><AdminLayout><AdminDsaProblemEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dsa/problems/:id/edit" element={<AdminRoute><AdminLayout><AdminDsaProblemEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/homepage" element={<AdminRoute><AdminLayout><AdminHomepageConfig /></AdminLayout></AdminRoute>} />
      <Route path="/admin/hero-section" element={<AdminRoute><AdminLayout><AdminHeroSection /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dbms" element={<AdminRoute><AdminLayout><AdminDbmsList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dbms/lessons" element={<AdminRoute><AdminLayout><AdminDbmsList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dbms/lessons/new" element={<AdminRoute><AdminLayout><AdminDbmsLessonEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dbms/lessons/:id/edit" element={<AdminRoute><AdminLayout><AdminDbmsLessonEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dbms/subtopics" element={<AdminRoute><AdminLayout><AdminDbmsAllSubtopics /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dbms/lessons/:lessonId/subtopics" element={<AdminRoute><AdminLayout><AdminDbmsSubtopicList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dbms/lessons/:lessonId/subtopics/new" element={<AdminRoute><AdminLayout><AdminDbmsSubtopicEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dbms/lessons/:lessonId/subtopics/:id/edit" element={<AdminRoute><AdminLayout><AdminDbmsSubtopicEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dbms/problems" element={<AdminRoute><AdminLayout><AdminDbmsProblemList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dbms/problems/new" element={<AdminRoute><AdminLayout><AdminDbmsProblemEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dbms/problems/:id/edit" element={<AdminRoute><AdminLayout><AdminDbmsProblemEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dbms/meta" element={<AdminRoute><AdminLayout><AdminDbmsMeta /></AdminLayout></AdminRoute>} />
      <Route path="/admin/os" element={<AdminRoute><AdminLayout><AdminOsList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/os/lessons" element={<AdminRoute><AdminLayout><AdminOsList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/os/lessons/new" element={<AdminRoute><AdminLayout><AdminOsLessonEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/os/lessons/:id/edit" element={<AdminRoute><AdminLayout><AdminOsLessonEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/os/subtopics" element={<AdminRoute><AdminLayout><AdminOsAllSubtopics /></AdminLayout></AdminRoute>} />
      <Route path="/admin/os/lessons/:lessonId/subtopics" element={<AdminRoute><AdminLayout><AdminOsSubtopicList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/os/lessons/:lessonId/subtopics/new" element={<AdminRoute><AdminLayout><AdminOsSubtopicEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/os/lessons/:lessonId/subtopics/:id/edit" element={<AdminRoute><AdminLayout><AdminOsSubtopicEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/os/problems" element={<AdminRoute><AdminLayout><AdminOsProblemList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/os/problems/new" element={<AdminRoute><AdminLayout><AdminOsProblemEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/os/problems/:id/edit" element={<AdminRoute><AdminLayout><AdminOsProblemEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/os/meta" element={<AdminRoute><AdminLayout><AdminOsMeta /></AdminLayout></AdminRoute>} />
      <Route path="/admin/programming" element={<AdminRoute><AdminLayout><AdminProgrammingList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/programming/lessons" element={<AdminRoute><AdminLayout><AdminProgrammingList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/programming/lessons/new" element={<AdminRoute><AdminLayout><AdminProgrammingLessonEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/programming/lessons/:id/edit" element={<AdminRoute><AdminLayout><AdminProgrammingLessonEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/programming/subtopics" element={<AdminRoute><AdminLayout><AdminProgrammingAllSubtopics /></AdminLayout></AdminRoute>} />
      <Route path="/admin/programming/lessons/:lessonId/subtopics" element={<AdminRoute><AdminLayout><AdminProgrammingSubtopicList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/programming/lessons/:lessonId/subtopics/new" element={<AdminRoute><AdminLayout><AdminProgrammingSubtopicEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/programming/lessons/:lessonId/subtopics/:id/edit" element={<AdminRoute><AdminLayout><AdminProgrammingSubtopicEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/programming/problems" element={<AdminRoute><AdminLayout><AdminProgrammingProblemList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/programming/problems/new" element={<AdminRoute><AdminLayout><AdminProgrammingProblemEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/programming/problems/:id/edit" element={<AdminRoute><AdminLayout><AdminProgrammingProblemEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/programming/meta" element={<AdminRoute><AdminLayout><AdminProgrammingMeta /></AdminLayout></AdminRoute>} />
      <Route path="/admin/blog" element={<AdminRoute><AdminLayout><AdminBlogList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/blog/new" element={<AdminRoute><AdminLayout><AdminBlogEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/blog/:id/edit" element={<AdminRoute><AdminLayout><AdminBlogEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/media" element={<AdminRoute><AdminLayout><AdminMedia /></AdminLayout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
      <Route path="/admin/users/:id/edit" element={<AdminRoute><AdminLayout><AdminUserEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/qa" element={<AdminRoute><AdminLayout><AdminQA /></AdminLayout></AdminRoute>} />
      <Route path="/admin/languages" element={<AdminRoute><AdminLayout><AdminLanguagesList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/languages/new" element={<AdminRoute><AdminLayout><AdminLanguageEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/languages/:id/edit" element={<AdminRoute><AdminLayout><AdminLanguageEdit /></AdminLayout></AdminRoute>} />
      <Route path="/admin/newsletter" element={<AdminRoute><AdminLayout><AdminNewsletter /></AdminLayout></AdminRoute>} />
      <Route path="/admin/dsa/meta" element={<AdminRoute><AdminLayout><AdminDsaMeta /></AdminLayout></AdminRoute>} />
      <Route path="/admin/topics" element={<AdminRoute><AdminLayout><AdminTopics /></AdminLayout></AdminRoute>} />
      <Route path="/admin/why-section" element={<AdminRoute><AdminLayout><AdminWhySection /></AdminLayout></AdminRoute>} />
      <Route path="/admin/why-the-job-starter" element={<AdminRoute><AdminLayout><AdminWhyTheJobStarter /></AdminLayout></AdminRoute>} />
      <Route path="/admin/how-it-works" element={<AdminRoute><AdminLayout><AdminHowItWorks /></AdminLayout></AdminRoute>} />
      <Route path="/admin/about-page" element={<AdminRoute><AdminLayout><AdminAboutPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/testimonials" element={<AdminRoute><AdminLayout><AdminTestimonials /></AdminLayout></AdminRoute>} />
      <Route path="/admin/progress-messages" element={<AdminRoute><AdminLayout><AdminProgressMessages /></AdminLayout></AdminRoute>} />
      <Route path="/admin/coaching-centers" element={<AdminRoute><AdminLayout><AdminCoachingCenters /></AdminLayout></AdminRoute>} />
      <Route path="/admin/coaching-centers/:id" element={<AdminRoute><AdminLayout><AdminCoachingCenterDetail /></AdminLayout></AdminRoute>} />
      <Route path="/admin/coaching-centers/:centerId/students/:userId" element={<AdminRoute><AdminLayout><AdminCoachingCenterStudentDetail /></AdminLayout></AdminRoute>} />
      <Route path="/admin/batches/:id" element={<AdminRoute><AdminLayout><AdminBatchDetail /></AdminLayout></AdminRoute>} />
      <Route path="/admin/plans" element={<AdminRoute><AdminLayout><AdminPlanList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/plans/new" element={<AdminRoute><AdminLayout><AdminPlanBuilder /></AdminLayout></AdminRoute>} />
      <Route path="/admin/plans/:id" element={<AdminRoute><AdminLayout><AdminPlanBuilder /></AdminLayout></AdminRoute>} />
<Route path="/admin/plans/:id/edit" element={<AdminRoute><AdminLayout><AdminPlanBuilder /></AdminLayout></AdminRoute>} />

      <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
    </Routes>
  );
}

export default function App() {
  /* Select only initTheme by reference — avoids re-rendering App when theme changes elsewhere */
  const initTheme = useThemeStore(state => state.initTheme);

  useEffect(() => {
    initTheme();
  }, []);

  const app = (
    <HelmetProvider>
      <BrowserRouter>
        <InitLanguages />
        <AppRoutes />
      </BrowserRouter>
    </HelmetProvider>
  );

  /*
   * ClerkGate — blocks rendering until Clerk is fully initialized.
   * This ensures all pages have access to the auth token on first render,
   * preventing a 401 race when pages fire API calls immediately on mount.
   */
  function ClerkGate({ children }) {
    const { isLoaded } = useAuth();
    if (!isLoaded) {
      return (
        <motion.div
          className="pageloader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <div className="pageloader__backdrop" />
          <div className="pageloader__box">
            <div className="pageloader__spinner">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="pageloader__dot"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                />
              ))}
            </div>
            <p className="pageloader__status">INITIALIZING AUTH...</p>
          </div>
        </motion.div>
      );
    }
    return children;
  }

  /* ClerkProvider wraps the router so ALL routes have Clerk context */
  if (HAS_CLERK) {
    return (
      <ClerkProvider publishableKey={clerkPubKey}>
        <AuthSync />
        <ClerkGate>
          {app}
        </ClerkGate>
      </ClerkProvider>
    );
  }

  return app;
}
