import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border/50 bg-background/80 pt-24 pb-8 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            About This Project
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="prose prose-slate max-w-none dark:prose-invert">
            {/* Letter-style document */}
            <div className="space-y-8 text-base leading-relaxed text-foreground">
              {/* Disclaimer Section */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Important Disclaimer</h2>
                <p>
                  This website is a demonstration project and is not intended for real-world use. 
                  It has been created solely for educational and academic purposes as part of a 
                  university course project.
                </p>
                <p>
                  This website is not affiliated with, endorsed by, or associated with the city of 
                  Valencia, any official tourist agencies, tourism boards, or any other tourism-related 
                  companies or programs. All content, including landmarks, spots, and reviews, is 
                  fictional and used for demonstration purposes only.
                </p>
                <p>
                  We do not claim any accuracy regarding business information, locations, or any 
                  other details presented on this platform. Users should not rely on this website 
                  for actual travel planning or tourism information.
                </p>
              </section>

              {/* Academic Context */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Academic Context</h2>
                <p>
                  This project was developed for the <strong>Faculty of Economics and Business 
                  Administration (FEAA)</strong> at the <strong>West University of Timișoara (UVT)</strong>, 
                  as part of the <strong>"Programare Internet"</strong> (Internet Programming) course.
                </p>
                <p>
                  The purpose of this project is to demonstrate understanding of modern web development 
                  technologies, full-stack development principles, database design, and user interface 
                  design.
                </p>
              </section>

              {/* Development Team */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Development Team</h2>
                <p>
                  This project was collaboratively developed by a team of 8 students. Each team member 
                  contributed to different aspects of the project, with specific focus on individual systems 
                  and features:
                </p>
                
                <div className="space-y-6">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">Borcean Patrick</h3>
                      <span className="rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">Project Lead</span>
                    </div>
                    <p className="text-muted-foreground">
                      <strong>Responsibilities:</strong> Project architecture and system design, complete 
                      authentication and authorization system (better-auth integration, session management, 
                      role-based access control), database schema design and implementation (Drizzle ORM, 
                      SQLite optimization), core API infrastructure and routing, bucket list system 
                      (database schema, API endpoints, status management), full-stack integration and 
                      deployment configuration, code review and quality assurance, technical documentation.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Boldizsar Denis</h3>
                    <p className="text-muted-foreground">
                      <strong>Responsibilities:</strong> User reviews system (review submission, rating 
                      display, review moderation UI), review API endpoints and database interactions, 
                      latest reviews landing page component, review display components across landmark 
                      and spot detail pages.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Botan Denis</h3>
                    <p className="text-muted-foreground">
                      <strong>Responsibilities:</strong> Landmarks management system (landmark detail 
                      pages, image galleries, Google Maps integration), landmarks carousel component, 
                      landmarks listing pages with filtering and search functionality.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Golban Sebastian</h3>
                    <p className="text-muted-foreground">
                      <strong>Responsibilities:</strong> Spots and businesses management system (business 
                      application flow, spot creation and editing), business approval system for admins, 
                      local favorites landing page component, spots listing and detail pages.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Andreica Marian</h3>
                    <p className="text-muted-foreground">
                      <strong>Responsibilities:</strong> Image storage system (upload handling, primary 
                      image selection, image gallery components), category system (category creation, 
                      assignment, and normalization), UI component library integration and customization.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Avram Andrei</h3>
                    <p className="text-muted-foreground">
                      <strong>Responsibilities:</strong> User profile system (profile page, bucket list 
                      interface, user reviews display, business management interface), bucket list button 
                      component, responsive design implementation across user-facing pages.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Bostan Laurentiu</h3>
                    <p className="text-muted-foreground">
                      <strong>Responsibilities:</strong> Landing page components (hero section, call-to-action 
                      cards), navigation and footer components, admin dashboard interface, overall UI/UX 
                      polish and responsive design consistency, accessibility features.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Bologa Cristian</h3>
                    <p className="text-muted-foreground">
                      <strong>Responsibilities:</strong> Search and filtering system (landmark and spot search 
                      functionality, category filtering, location-based filtering), form validation system 
                      (Zod schema implementation, client and server-side validation), data seeding system 
                      (initial content population, database seeding scripts), error handling and user feedback 
                      systems.
                    </p>
                  </div>
                </div>
              </section>

              {/* Technical Information */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Technical Architecture</h2>
                
                <div className="space-y-6">
                  {/* Frontend */}
                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">Frontend Technologies</h3>
                    <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                      <li>
                        <strong>Next.js 16.1.0</strong> - React framework with App Router for server-side 
                        rendering and static site generation
                      </li>
                      <li>
                        <strong>React 19.2.3</strong> - UI library for building component-based interfaces
                      </li>
                      <li>
                        <strong>TypeScript</strong> - Type-safe JavaScript for improved developer experience
                      </li>
                      <li>
                        <strong>Tailwind CSS 4</strong> - Utility-first CSS framework for rapid UI development
                      </li>
                      <li>
                        <strong>Radix UI</strong> - Headless UI components (Dialog, Dropdown, etc.)
                      </li>
                      <li>
                        <strong>React Hook Form</strong> - Form state management and validation
                      </li>
                      <li>
                        <strong>Zod</strong> - Schema validation library
                      </li>
                      <li>
                        <strong>Lucide React</strong> - Icon library
                      </li>
                    </ul>
                  </div>

                  {/* Backend */}
                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">Backend Technologies</h3>
                    <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                      <li>
                        <strong>Next.js API Routes</strong> - Server-side API endpoints built into the 
                        Next.js framework
                      </li>
                      <li>
                        <strong>Better Auth</strong> - Authentication library with email/password support 
                        and admin plugins
                      </li>
                      <li>
                        <strong>Drizzle ORM</strong> - TypeScript ORM for database interactions
                      </li>
                      <li>
                        <strong>SQLite</strong> - Lightweight relational database (via better-sqlite3)
                      </li>
                      <li>
                        <strong>Node.js</strong> - JavaScript runtime environment
                      </li>
                    </ul>
                  </div>

                  {/* Database */}
                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">Database Schema</h3>
                    <p className="text-muted-foreground">
                      The application uses a SQLite database with the following main entities:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                      <li><strong>Users</strong> - User accounts with authentication and profile information</li>
                      <li><strong>Sessions & Accounts</strong> - Authentication and session management</li>
                      <li><strong>Landmarks</strong> - Historical and cultural sites with descriptions and images</li>
                      <li><strong>Spots</strong> - Businesses, restaurants, cafes, shops with detailed information</li>
                      <li><strong>Businesses</strong> - Business owner accounts for managing spots</li>
                      <li><strong>Reviews</strong> - User reviews for both landmarks and spots</li>
                      <li><strong>Bucket List</strong> - User-saved items (landmarks/spots) with visit status</li>
                      <li><strong>Images</strong> - Image storage for landmarks and spots with primary image support</li>
                    </ul>
                  </div>

                  {/* Architecture */}
                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">Application Architecture</h3>
                    <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                      <li>
                        <strong>Full-Stack Application</strong> - Single Next.js application handling both 
                        frontend and backend
                      </li>
                      <li>
                        <strong>Server Components</strong> - Default React Server Components for efficient 
                        data fetching
                      </li>
                      <li>
                        <strong>Client Components</strong> - Interactive components using "use client" directive
                      </li>
                      <li>
                        <strong>API Routes</strong> - RESTful API endpoints for CRUD operations
                      </li>
                      <li>
                        <strong>Image Storage</strong> - Local file storage system for user-uploaded images
                      </li>
                      <li>
                        <strong>Authentication</strong> - Session-based authentication with role management (admin/user)
                      </li>
                      <li>
                        <strong>Responsive Design</strong> - Mobile-first approach with Tailwind CSS breakpoints
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Closing */}
              <section className="space-y-4 border-t border-border pt-8">
                <p className="text-muted-foreground">
                  This project serves as a learning exercise and demonstration of modern web development 
                  practices. We hope it provides insight into how full-stack applications are built using 
                  contemporary technologies.
                </p>
                <p className="text-muted-foreground">
                  For questions or inquiries about this project, please contact the course instructors 
                  at FEAA, UVT.
                </p>
              </section>
            </div>

            {/* Thank You Card */}
            <div className="mt-12">
              <Card className="border-orange-600/20 bg-gradient-to-br from-orange-50 to-amber-50/50 p-6 dark:from-orange-950/20 dark:to-amber-950/10">
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  Acknowledgments
                </h3>
                <p className="text-muted-foreground">
                  We would like to thank <strong>Eranova</strong> for 
                  providing the required infrastructure for hosting this web application.<br/><br/>
                  For transparency, we would like to mention that <strong>Borcean Patrick</strong> is directly affiliated with <strong>Eranova</strong>.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

