# ODOO HACKATHON - COMPREHENSIVE CODE GUIDE

## Executive Summary
This guide ensures that development follows Odoo's hiring hackathon standards. The focus is on **thoughtful design, scalable architecture, and well-structured code** — NOT coding speed.

---

## SECTION 1: CORE DEVELOPMENT PRINCIPLES

### 1.1 Philosophy
- **Quality > Speed**: Approach the problem thoughtfully before coding
- **Scalability First**: Design code that can grow and adapt
- **Showcase Skills**: Every line demonstrates technical competency
- **Real-World Standards**: Build like you're shipping to production

### 1.2 Target Audience
Evaluators are looking for:
- Solid technical skills
- Strong logical thinking
- Ability to work on dynamic, real-world projects
- Developers who can join the Odoo team

---

## SECTION 2: DATABASE DESIGN & BACKEND (CRITICAL PRIORITY)

### 2.1 Database Requirements

**MUST DO:**
- ✅ Use **MySQL or PostgreSQL** for your project
- ✅ Design database schema **thoughtfully** (this is heavily evaluated)
- ✅ Create proper **table relationships** (foreign keys, normalization)
- ✅ Implement **indexes** on frequently queried columns
- ✅ Use **transactions** for data integrity
- ✅ Version control your **database migration scripts**

**MUST NOT DO:**
- ❌ **DO NOT use Firebase, Supabase, or MongoDB Atlas** (Backend-as-a-Service platforms)
- ❌ **DO NOT rely on third-party platforms** for database management
- ❌ Do not use hardcoded data or SQLite for production

**Why This Matters:**
- Shows you understand relational database design
- Demonstrates risk mitigation (avoiding third-party platform bugs/issues)
- Proves you can build production-grade systems independently

### 2.2 Database Design Best Practices

```
DATABASE DESIGN CHECKLIST:

□ Schema Design
  - Tables are properly normalized (minimize redundancy)
  - Primary keys defined for all tables
  - Foreign key relationships established
  - Data types are appropriate (not everything is VARCHAR)

□ Relationships
  - One-to-Many relationships properly implemented
  - Many-to-Many relationships use junction tables
  - Cascading deletes/updates configured where appropriate

□ Performance
  - Indexes created on primary keys, foreign keys, and frequently searched columns
  - Query optimization considered (no N+1 queries)
  - Connection pooling implemented

□ Integrity
  - Constraints enforced at database level (NOT just in code)
  - Unique constraints for appropriate fields
  - NOT NULL constraints where required

□ Migrations
  - Version control includes database migration scripts
  - Easy to set up database for new team members
  - Schema changes are tracked and reversible
```

### 2.3 Backend API Design

**MUST DO:**
- ✅ Design **RESTful APIs** with clear endpoints
- ✅ Use **proper HTTP methods** (GET, POST, PUT, DELETE)
- ✅ Implement **consistent response formats** (JSON structure)
- ✅ Use **status codes correctly** (200, 201, 400, 404, 500, etc.)
- ✅ Version your APIs (e.g., /api/v1/...)
- ✅ Document all endpoints

**MUST NOT DO:**
- ❌ Avoid mixing HTTP methods inappropriately
- ❌ Don't return unstructured or inconsistent data
- ❌ Never expose sensitive database information in API responses

---

## SECTION 3: CODE STRUCTURE & ARCHITECTURE

### 3.1 Architecture Requirements

**MUST DO:**
- ✅ Use **modular architecture** with clear separation of concerns
- ✅ Follow the **MVC pattern** (Model-View-Controller) or similar
- ✅ Separate business logic from presentation layer
- ✅ Create **reusable components** and services
- ✅ Follow **SOLID principles** where applicable

**Modular Architecture Breakdown:**

```
project/
├── backend/
│   ├── models/              (Database models, schemas)
│   ├── controllers/         (API endpoints, request handling)
│   ├── services/            (Business logic)
│   ├── middleware/          (Auth, validation, error handling)
│   ├── utils/               (Helper functions)
│   ├── database/            (Migrations, seeds, config)
│   └── tests/               (Unit & integration tests)
├── frontend/
│   ├── pages/               (Page components)
│   ├── components/          (Reusable UI components)
│   ├── services/            (API calls)
│   ├── utils/               (Frontend helpers)
│   └── styles/              (CSS/styling)
└── docs/                    (API documentation, setup guides)
```

### 3.2 Coding Standards

**MUST DO:**
- ✅ Use **consistent naming conventions**
  - camelCase for variables and functions
  - PascalCase for classes and components
  - UPPER_SNAKE_CASE for constants
- ✅ Write **meaningful variable and function names**
- ✅ Keep **functions small and focused** (single responsibility)
- ✅ Limit **function parameters** (prefer objects if >3 params)
- ✅ Add **comments for complex logic** (not for obvious code)
- ✅ Keep **code DRY** (Don't Repeat Yourself)

**Example - Function Naming:**
```
GOOD: getUserByEmail(email)
BAD:  getuser(e)
GOOD: validateEmailFormat(email)
BAD:  check(email)
```

---

## SECTION 4: INPUT VALIDATION & ERROR HANDLING

### 4.1 Robust Input Validation (CRITICAL)

**MUST DO:**
- ✅ Validate **ALL user inputs** on the backend
- ✅ Check **data types** (string, number, boolean, etc.)
- ✅ Validate **email format** with proper regex or library
- ✅ Check **string length** limits (min/max)
- ✅ Validate **numeric ranges** (age, quantity, etc.)
- ✅ Sanitize inputs to **prevent SQL injection**
- ✅ Validate **file uploads** (type, size)
- ✅ Check **required fields** are present

**Validation Example:**
```
Email Validation:
□ Check if field exists
□ Check if string
□ Check format matches email pattern
□ Provide clear error message: "Please enter a valid email address"

Age Validation:
□ Check if number
□ Check if >= 18 and <= 120
□ Provide clear error message: "Age must be between 18 and 120"
```

### 4.2 Error Handling & User Feedback

**MUST DO:**
- ✅ Handle **all error cases** gracefully
- ✅ Return **clear, user-friendly error messages** (not technical jargon)
- ✅ Use **proper HTTP error codes** (400, 401, 403, 404, 500)
- ✅ Log **errors on backend** for debugging
- ✅ Display **errors in UI** clearly to users
- ✅ Implement **try-catch blocks** in async operations

**MUST NOT DO:**
- ❌ Don't expose **system errors** to users (e.g., database stack traces)
- ❌ Don't silently fail without user feedback
- ❌ Don't use generic "Error" messages

**Error Response Example:**
```
GOOD:
{
  "success": false,
  "error": "Please enter a valid email address",
  "field": "email"
}

BAD:
{
  "error": "SQLSTATE[HY000]: General error: 1030"
}
```

---

## SECTION 5: VERSION CONTROL & GIT WORKFLOW

### 5.1 Git Best Practices

**MUST DO:**
- ✅ **All team members** must contribute to the repository
- ✅ Use **feature branches** (not everyone working on main)
- ✅ Write **meaningful commit messages**
  ```
  GOOD: "feat: Add email validation for user registration"
  BAD:  "update", "fix", "changes"
  ```
- ✅ Create **pull requests** for code review
- ✅ Review **each other's code** before merging
- ✅ Keep `.gitignore` properly configured
  - Exclude: node_modules/, .env, database backups, IDE files
  - Include: migration files, configuration templates

**MUST NOT DO:**
- ❌ Don't have **only one person managing** the repo
- ❌ Don't commit **node_modules, .env files, or secrets**
- ❌ Don't use **vague commit messages**

**Git Workflow Example:**
```
1. Team member pulls latest code: git pull origin main
2. Creates feature branch: git checkout -b feat/user-authentication
3. Makes changes and commits: git commit -m "feat: Implement JWT token validation"
4. Pushes to remote: git push origin feat/user-authentication
5. Creates Pull Request on GitHub
6. Team reviews and provides feedback
7. Merges after approval: git merge feat/user-authentication
```

---

## SECTION 6: USER INTERFACE & FRONTEND

### 6.1 UI/UX Requirements

**MUST DO:**
- ✅ Create **clean, professional UI** that's visually appealing
- ✅ Use **consistent color scheme** throughout the application
- ✅ Maintain **consistent typography** (font families, sizes)
- ✅ Implement **proper spacing and padding** (not cramped)
- ✅ Design **intuitive navigation menus**
- ✅ Ensure **UI flows logically** from page to page
- ✅ Make the UI **responsive** (mobile-friendly)
- ✅ Use **visual hierarchy** to guide user attention

**UI Checklist:**
```
□ Visual Design
  - Consistent color palette (primary, secondary, accent colors)
  - Professional typography (max 2-3 font families)
  - Adequate whitespace (not everything cramped)
  - Clear visual hierarchy (headings, emphasis, subtext)

□ Navigation
  - Clear menu structure
  - Easy to find features
  - Breadcrumbs or back buttons for context
  - Search functionality if applicable

□ Forms & Input
  - Clear labels for all input fields
  - Helpful placeholder text
  - Form validation feedback (real-time or on submit)
  - Clear submit/cancel buttons

□ Responsiveness
  - Works on desktop, tablet, mobile
  - Layout adapts to different screen sizes
  - Touch-friendly on mobile (larger buttons)

□ Accessibility
  - Sufficient color contrast
  - Alt text for images
  - Keyboard navigation support
  - Screen reader friendly
```

### 6.2 Presentation of UI

**MUST DO:**
- ✅ Make **interactive demos** of your UI during presentation
- ✅ Show **all major screens** and user flows
- ✅ Demonstrate **form validation and error handling**
- ✅ Show **real data** in action (not static screenshots)
- ✅ Test in **different screen sizes** if possible

---

## SECTION 7: TECHNOLOGY CHOICES

### 7.1 Technology Stack Guidance

**Best Practices:**
- ✅ Choose **technologies that make sense** for your problem
- ✅ Use **trending tech (AI, blockchain, chatbots) ONLY if it adds genuine value**
- ✅ Understand **why** you're using each technology
- ✅ Avoid **unnecessary complexity** for the sake of it

**MUST NOT DO:**
- ❌ Don't use AI/blockchain/trendy tech just to impress
- ❌ Don't copy-paste library code without understanding it
- ❌ Don't use multiple frameworks/tools that do the same thing

**Technology Selection Example:**
```
GOOD:
"We chose PostgreSQL because we need ACID transactions and complex relationships 
for our booking system. We selected React for the frontend because we need a 
responsive, interactive UI. We implemented WebSockets for real-time notifications."

BAD:
"We used blockchain because it's trending."
"We used 5 different API libraries without knowing which is best."
```

### 7.2 Learning & Understanding

**MUST DO:**
- ✅ **Understand the tools** you use
- ✅ Know **why** you chose each dependency
- ✅ Be able to **explain** each library's purpose
- ✅ Read **documentation** before using libraries
- ✅ Test **edge cases** for each library

**MUST NOT DO:**
- ❌ Don't **copy-paste code** from Stack Overflow
- ❌ Don't use **libraries without understanding them**
- ❌ Don't install **random packages** without vetting

---

## SECTION 8: DATA HANDLING

### 8.1 Real-Time & Dynamic Data (CRITICAL)

**MUST DO:**
- ✅ Use **real data from database**, not hardcoded JSON
- ✅ Implement **dynamic data fetching** from backend APIs
- ✅ Handle **data loading states** (loading, success, error)
- ✅ Implement **data refresh/pagination** if applicable
- ✅ Use **real timestamps** for any time-based data

**MUST NOT DO:**
- ❌ **Static JSON files** are only for quick prototyping
- ❌ Don't submit project with hardcoded sample data
- ❌ Don't fake dynamic features with static data

**Example - Data Handling:**
```
GOOD (Final Solution):
1. User clicks "Load Users"
2. Frontend calls GET /api/v1/users
3. Backend queries PostgreSQL
4. Returns dynamic data: [{id: 1, name: "John", email: "john@example.com"}, ...]
5. Frontend displays with loading state management

ACCEPTABLE (Prototyping Only):
1. Quick demo with users.json file
2. Used only during early development
3. REPLACED with real database before submission

BAD:
1. Final submission still uses hardcoded JSON
2. No database integration
3. Data doesn't change in response to user actions
```

---

## SECTION 9: PERFORMANCE & SCALABILITY

### 9.1 Performance Requirements

**MUST DO:**
- ✅ Optimize **database queries** (use indexes, pagination)
- ✅ Avoid **N+1 query problems**
- ✅ Implement **caching** where appropriate
- ✅ Minimize **frontend bundle size**
- ✅ Lazy load **images and components**
- ✅ Monitor **API response times**

**MUST NOT DO:**
- ❌ Don't load **all records** at once (use pagination)
- ❌ Don't run **unoptimized queries** in loops
- ❌ Don't ignore **performance metrics**

### 9.2 Scalability Considerations

**MUST DO:**
- ✅ Design **code that can handle growth**
- ✅ Use **parameterized queries** (prevent SQL injection)
- ✅ Implement **proper authentication/authorization**
- ✅ Design **APIs that are version-able**
- ✅ Use **environment variables** for configuration

---

## SECTION 10: SECURITY

### 10.1 Security Requirements

**MUST DO:**
- ✅ Use **environment variables** for sensitive data (API keys, DB passwords)
- ✅ Implement **authentication** (JWT tokens, sessions)
- ✅ Implement **authorization** (user roles, permissions)
- ✅ Use **hashed passwords** (bcrypt, scrypt)
- ✅ Use **parameterized queries** to prevent SQL injection
- ✅ Implement **CSRF protection** if using cookies
- ✅ Validate **input on backend** (not just frontend)
- ✅ Never **log sensitive data**

**MUST NOT DO:**
- ❌ Don't **store passwords in plain text**
- ❌ Don't **commit .env files** to Git
- ❌ Don't **expose API keys** in frontend code
- ❌ Don't **trust frontend validation** alone
- ❌ Don't **log sensitive information**

---

## SECTION 11: TESTING & QUALITY ASSURANCE

### 11.1 Testing Requirements

**MUST DO:**
- ✅ Write **unit tests** for critical business logic
- ✅ Write **integration tests** for API endpoints
- ✅ Test **error cases and edge cases**
- ✅ Test **input validation** thoroughly
- ✅ Test **authentication/authorization** flows
- ✅ Perform **manual testing** of UI before submission

**MUST NOT DO:**
- ❌ Don't **skip testing** edge cases
- ❌ Don't **only test happy path**
- ❌ Don't **submit code with broken functionality**

### 11.2 Debugging Skills

**MUST DO:**
- ✅ Use **debuggers** (browser dev tools, IDE debuggers)
- ✅ Use **logging** to trace execution
- ✅ Use **error tracking** tools if available
- ✅ Document **bugs found and fixed**

---

## SECTION 12: DOCUMENTATION

### 12.1 Required Documentation

**MUST DO:**
- ✅ Create **README.md** with setup instructions
  - How to clone and install
  - Environment variables needed
  - Database setup commands
  - How to run the application
  - API documentation or examples

- ✅ Document **API endpoints** (postman collection or markdown)
  - Endpoint URL
  - HTTP method
  - Required parameters
  - Response format
  - Example requests/responses

- ✅ Document **database schema**
  - Table descriptions
  - Column definitions
  - Relationships

- ✅ Document **architecture decisions**
  - Why certain technologies were chosen
  - How components interact
  - Scaling considerations

**MUST NOT DO:**
- ❌ Don't **submit without documentation**
- ❌ Don't **assume** reviewers know how to set up your project

---

## SECTION 13: PRESENTATION GUIDELINES

### 13.1 Presentation Requirements

**MUST DO:**
- ✅ **Everyone on the team** must participate in presentation
- ✅ It's about **shared ownership and teamwork**, not who speaks best
- ✅ Demonstrate **live, working application**
- ✅ Show **database design** and explain relationships
- ✅ Show **architecture overview**
- ✅ Walk through **key features and flows**
- ✅ Explain **technology choices** and why they matter
- ✅ Discuss **challenges and how you solved them**
- ✅ Show **code quality** and design patterns used
- ✅ Mention **what you learned** during the hackathon

**Presentation Structure:**
```
1. Introduction (1 min)
   - Problem statement
   - Team member introductions

2. Architecture Overview (2-3 min)
   - System design
   - Technology stack
   - Why these technologies

3. Database Design (2-3 min)
   - Schema diagram
   - Key relationships
   - Design decisions

4. Live Demo (5-7 min)
   - Walk through main features
   - Show UI quality
   - Demonstrate error handling
   - Show real data from database

5. Code Quality (2-3 min)
   - Show modular architecture
   - Highlight good design patterns
   - Show testing approach

6. Challenges & Solutions (2 min)
   - What was difficult
   - How you solved it
   - What you learned

7. Q&A (Open)
```

---

## SECTION 14: EVALUATION CRITERIA

### 14.1 What Evaluators Will Look For

**Scoring Areas (in priority order):**

1. **Database Design** (HIGHEST PRIORITY)
   - Schema is well-thought-out
   - Proper normalization and relationships
   - Appropriate use of constraints and indexes
   - Shows understanding of data modeling

2. **Code Quality & Architecture**
   - Modular, well-organized code
   - Clear separation of concerns
   - Following design patterns
   - Code is readable and maintainable

3. **Logical Thinking & Problem Solving**
   - Thoughtful approach to the problem
   - Handling of edge cases
   - Scalable solutions
   - Attention to detail

4. **Frontend Design & UX**
   - Clean, professional UI
   - Intuitive navigation
   - Consistent design
   - Responsive and interactive

5. **Input Validation & Error Handling**
   - Comprehensive validation
   - User-friendly error messages
   - Graceful degradation

6. **Performance & Scalability**
   - Efficient queries
   - Optimized frontend
   - Consideration for growth

7. **Security**
   - Proper authentication/authorization
   - Safe data handling
   - Secure coding practices

8. **Testing & Debugging**
   - Evidence of testing
   - Debugging approach
   - Quality assurance

9. **Documentation & Presentation**
   - Clear, comprehensive docs
   - Professional presentation
   - Team collaboration evident

### 14.2 Red Flags (What NOT to do)

❌ Using Firebase, Supabase, or MongoDB Atlas instead of PostgreSQL/MySQL
❌ Hardcoded data or static JSON in final submission
❌ Poor database design or no relationships
❌ All code in one file with no modular structure
❌ Only one team member contributing to Git repo
❌ No error handling or validation
❌ Copying library code without understanding it
❌ Only one person presenting
❌ No documentation
❌ UI that looks unpolished or inconsistent

---

## SECTION 15: QUICK REFERENCE CHECKLIST

### Before Submission:

```
DATABASE & BACKEND:
□ Using MySQL or PostgreSQL (NOT Firebase/Supabase)
□ Database schema is normalized and well-designed
□ Indexes created on key columns
□ All migrations in version control
□ API endpoints return consistent JSON format
□ API properly uses HTTP methods and status codes

CODE QUALITY:
□ Code is modular with clear separation of concerns
□ Consistent naming conventions throughout
□ Functions are focused and small
□ DRY principle followed
□ Comments explain complex logic

INPUT & ERROR HANDLING:
□ All user inputs validated on backend
□ Clear, user-friendly error messages
□ HTTP status codes used correctly
□ No sensitive data exposed in errors

GIT & COLLABORATION:
□ All team members have commits
□ Feature branches used for development
□ Meaningful commit messages
□ No sensitive files (.env, secrets) committed
□ .gitignore properly configured

FRONTEND:
□ Clean, professional UI design
□ Consistent color scheme and typography
□ Responsive design (mobile-friendly)
□ Interactive and engaging
□ Real data displayed from database

DATA:
□ Using real database data (NOT hardcoded JSON)
□ Dynamic data fetching from APIs
□ Loading states handled properly

DOCUMENTATION:
□ README.md with setup instructions
□ API documentation
□ Database schema documented
□ Architecture decisions explained

TESTING:
□ Critical functions have tests
□ Manual testing completed
□ Error cases tested
□ No broken functionality

PRESENTATION READY:
□ Everyone prepared to present
□ Live demo tested and working
□ Can explain architecture and design decisions
□ Can discuss challenges and learnings
```

---

## SECTION 16: MINDSET FOR SUCCESS

Remember:
- **This is a hiring hackathon** — showcase your best work
- **Quality over speed** — one well-built feature beats many rushed ones
- **Thoughtfulness matters** — reviewers want to see your problem-solving approach
- **Collaboration wins** — demonstrate teamwork in code and presentation
- **Real-world practices** — write code like you're shipping to production
- **Learn something** — understand every technology and library you use
- **Have fun** — enjoy the process of building something meaningful

**Final Words:**
The Odoo team is looking for developers who think carefully, code well, and can work on complex real-world projects. This hackathon is your opportunity to demonstrate those qualities. Focus on building something you're proud of, something that shows your true capabilities.

Good luck! 🚀
