-- Schema definition for Digital Q&A Book Application

DROP TABLE IF EXISTS qa_items CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'reader',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Demo Users (Password: Admin@123 for admin, Reader@123 for reader)
INSERT INTO users (id, username, email, password_hash, role) VALUES
(1, 'admin', 'admin@qabook.com', '$2b$10$ouJrtglYzX/QmyoY93pZE.qxFtEyORKJbNplOuRQiT4azqv.YA9ne', 'admin'),
(2, 'bookworm', 'reader@qabook.com', '$2b$10$Qs8Jyjd0jErQViT6UwZnW.g2/5xcjJac0bJ8fEo1OJnrQSSqrri8.', 'reader');

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Create Chapters Table
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Q&A Items Table
CREATE TABLE qa_items (
    id SERIAL PRIMARY KEY,
    chapter_id INT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Intermediate',
    tags TEXT[] DEFAULT '{}',
    order_index INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup by chapter
CREATE INDEX idx_qa_chapter_id ON qa_items(chapter_id);

-- Seed Data: Chapters
INSERT INTO chapters (id, title, description, order_index) VALUES
(1, 'Modern Frontend Architecture', 'Deep dive into component patterns, reactive state primitives, reactivity models, and frontend performance.', 1),
(2, 'Backend & Distributed Systems', 'Core concepts covering RESTful APIs, caching strategies, microservices, concurrency, and security.', 2),
(3, 'Database Engineering & Storage', 'Relational modeling, indexing techniques, transactions, ACID guarantees, and query optimization.', 3);

-- Reset sequence for chapters
SELECT setval('chapters_id_seq', (SELECT MAX(id) FROM chapters));

-- Seed Data: Q&A Items (12 Items)
INSERT INTO qa_items (chapter_id, question, answer, difficulty, tags, order_index) VALUES
(
    1,
    'What are Angular Signals and how do they differ from RxJS Observables for local state?',
    'Angular Signals are reactive primitives that hold a value and synchronously notify interested consumers when that value changes. Unlike RxJS Observables, Signals are synchronous, glitch-free, do not require manual subscriptions or unsubscription handling (preventing memory leaks), and integrate natively with Angular OnPush change detection without Zone.js.',
    'Intermediate',
    ARRAY['Angular', 'Signals', 'Reactivity', 'State Management'],
    1
),
(
    1,
    'Explain the difference between Server-Side Rendering (SSR) and Client-Side Rendering (CSR).',
    'Client-Side Rendering (CSR) downloads a minimal HTML shell and lets JavaScript render content in the browser, offering rich interactive experiences after load but slower initial paints and harder SEO. Server-Side Rendering (SSR) generates full HTML on the server per request, providing faster First Contentful Paint (FCP) and optimal SEO, followed by hydration for interactivity.',
    'Beginner',
    ARRAY['Frontend', 'SSR', 'CSR', 'Web Performance'],
    2
),
(
    1,
    'How does CSS Container Queries differ from traditional CSS Media Queries?',
    'CSS Media Queries evaluate the overall viewport dimensions (screen width/height) to apply styling rules. In contrast, Container Queries evaluate the dimensions of a specific parent container element using `container-type: inline-size`. This allows reusable components to adapt dynamically based on where they are placed in the layout, regardless of the screen size.',
    'Intermediate',
    ARRAY['CSS', 'Tailwind', 'Responsive Design', 'Layout'],
    3
),
(
    1,
    'What is the Virtual DOM and why do modern frameworks like Svelte or Angular 17+ move away from it?',
    'The Virtual DOM is an in-memory lightweight representation of the real DOM. Frameworks diff it against previous trees to batch real DOM updates. Modern frameworks move away from it because diffing has runtime overhead; instead, fine-grained reactivity (such as Signals or compile-time reactivity) directly tracks dependencies and surgically updates only the exact DOM nodes that changed.',
    'Advanced',
    ARRAY['DOM', 'Frontend', 'Architecture', 'Performance'],
    4
),
(
    2,
    'What is idempotent HTTP design and which HTTP methods must be idempotent?',
    'An HTTP method is considered idempotent if the side-effects of making multiple identical requests are identical to making a single request. GET, HEAD, PUT, DELETE, and OPTIONS are idempotent. POST is NOT idempotent because repeating requests typically creates multiple distinct resources.',
    'Intermediate',
    ARRAY['REST', 'HTTP', 'API Design', 'Backend'],
    1
),
(
    2,
    'How does CORS work and how does the browser enforce it?',
    'Cross-Origin Resource Sharing (CORS) is a browser security mechanism that restricts HTTP requests initiated from client-side scripts to a different origin (domain, protocol, or port). The browser sends Preflight OPTIONS requests for non-simple requests, checking server response headers like `Access-Control-Allow-Origin` and `Access-Control-Allow-Methods` before allowing the client to consume the response.',
    'Intermediate',
    ARRAY['CORS', 'Security', 'Express', 'HTTP'],
    2
),
(
    2,
    'What is the difference between horizontal and vertical scaling in distributed backends?',
    'Vertical scaling (scaling up) means adding more hardware resources (CPU, RAM, NVMe storage) to a single machine; it has a hard hardware ceiling and single point of failure. Horizontal scaling (scaling out) involves adding more server instances behind a load balancer, providing high availability, elastic elasticity, and fault tolerance at the cost of distributed coordination complexity.',
    'Beginner',
    ARRAY['Distributed Systems', 'Scaling', 'Cloud', 'Architecture'],
    3
),
(
    2,
    'Explain the Token Bucket algorithm used in API Rate Limiting.',
    'In the Token Bucket algorithm, a bucket of fixed capacity holds tokens. Tokens are continuously added at a constant rate up to the bucket capacity. When an incoming API request arrives, it attempts to consume one or more tokens. If sufficient tokens are present, the request proceeds; otherwise, it is throttled with HTTP 429 (Too Many Requests). This permits short bursts while maintaining a strict long-term rate.',
    'Advanced',
    ARRAY['Rate Limiting', 'Algorithms', 'Security', 'APIs'],
    4
),
(
    3,
    'Explain ACID properties in relational database management systems (RDBMS).',
    'ACID stands for Atomicity (all operations in a transaction succeed or all roll back), Consistency (transactions preserve defined constraints, keys, and rules), Isolation (concurrent transactions execute independently without dirty reads or conflicts), and Durability (committed transactions survive crashes and are permanently saved to persistent storage via write-ahead logging).',
    'Intermediate',
    ARRAY['PostgreSQL', 'SQL', 'ACID', 'Transactions'],
    1
),
(
    3,
    'What is a B-Tree index in PostgreSQL and when should you avoid creating one?',
    'A B-Tree (Balanced Tree) is the default index type in PostgreSQL, maintaining sorted data in logarithmic O(log N) lookup time for equality (=) and range queries (<, <=, >, >=, BETWEEN). You should avoid indexing frequently written columns with very low cardinality (e.g., boolean flags) or small tables where full table sequential scans are faster than index lookups.',
    'Advanced',
    ARRAY['PostgreSQL', 'Indexing', 'B-Tree', 'Performance'],
    2
),
(
    3,
    'What causes the N+1 query problem and how do you resolve it?',
    'The N+1 problem occurs when an application executes 1 query to fetch parent records, followed by N separate queries to fetch related child records for each parent. It is resolved by eager loading child records using SQL JOINs (`SELECT ... FROM parent JOIN child ON ...`) or batch fetching using an `IN (...)` clause (`SELECT ... WHERE parent_id IN (...)`).',
    'Intermediate',
    ARRAY['Databases', 'SQL', 'Optimization', 'ORM'],
    3
),
(
    3,
    'What is Connection Pooling and why is it crucial for PostgreSQL?',
    'PostgreSQL uses a process-per-connection architecture where each new client connection spawns an operating system process consuming ~2-10 MB of memory and incurring connection handshake overhead. Connection pooling maintains a pool of pre-established, reusable database connections, minimizing connection churn, resource exhaustion, and latency under high concurrent traffic.',
    'Beginner',
    ARRAY['PostgreSQL', 'Connection Pooling', 'Performance', 'DevOps'],
    4
);
