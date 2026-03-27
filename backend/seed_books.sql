-- ============================================================================
-- Pustak Tracker — Book Seed Data
-- Run in MySQL Workbench to populate categories and books.
-- ============================================================================

USE pustak_tracker;

-- ============================================================================
-- CATEGORIES (insert only if not already present)
-- ============================================================================

INSERT IGNORE INTO categories (name, description) VALUES
('Computer Science Fundamentals', 'Core CS theory — algorithms, data structures, discrete math, and foundational computer science'),
('Software Development & Engineering', 'Software design, clean code practices, architecture patterns, and engineering methodologies'),
('AI/ML/DL/RL', 'Artificial intelligence, machine learning, deep learning, reinforcement learning, NLP, and computer vision'),
('Philosophy', 'Philosophy of mind, AI ethics, computational philosophy, and interdisciplinary thinking'),
('Web Development & Backend', 'Full-stack web development, APIs, frameworks, HTTP, and backend engineering'),
('Database & Data Structures', 'Database systems, SQL, data modeling, and data-intensive application design'),
('Advanced Topics', 'Compilers, operating systems, networking, and cryptography');

-- ============================================================================
-- BOOKS
-- Barcode format: BOOK-XXXX (auto-generated sequential IDs)
-- ============================================================================

-- Get category IDs dynamically
SET @cs_fund = (SELECT id FROM categories WHERE name = 'Computer Science Fundamentals');
SET @sw_eng  = (SELECT id FROM categories WHERE name = 'Software Development & Engineering');
SET @ai_ml   = (SELECT id FROM categories WHERE name = 'AI/ML/DL/RL');
SET @philo   = (SELECT id FROM categories WHERE name = 'Philosophy');
SET @webdev  = (SELECT id FROM categories WHERE name = 'Web Development & Backend');
SET @db_ds   = (SELECT id FROM categories WHERE name = 'Database & Data Structures');
SET @adv     = (SELECT id FROM categories WHERE name = 'Advanced Topics');

-- ── Computer Science Fundamentals ──────────────────────────────────────────

INSERT IGNORE INTO books (title, author, publisher, isbn, barcode_id, category_id, description, total_copies, available_copies) VALUES
('The Art of Computer Programming', 'Donald Knuth', 'Addison-Wesley', '9780201896831', 'BOOK-0001', @cs_fund,
 'The definitive multi-volume series covering fundamental algorithms, combinatorial algorithms, and sorting & searching.', 2, 2),

('Introduction to Algorithms', 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', 'MIT Press', '9780262046305', 'BOOK-0002', @cs_fund,
 'The comprehensive textbook on algorithms, widely used in universities. Covers sorting, graph algorithms, dynamic programming, and more.', 3, 3),

('Algorithm Design Manual', 'Steven S. Skiena', 'Springer', '9783030542559', 'BOOK-0003', @cs_fund,
 'Practical guide to algorithm design with war stories from real-world applications and a comprehensive algorithm catalog.', 2, 2),

('Discrete Mathematics and Its Applications', 'Kenneth H. Rosen', 'McGraw-Hill', '9781259676512', 'BOOK-0004', @cs_fund,
 'Standard textbook for discrete math covering logic, sets, functions, relations, graphs, and number theory.', 3, 3),

('Structure and Interpretation of Computer Programs', 'Harold Abelson, Gerald Jay Sussman', 'MIT Press', '9780262510875', 'BOOK-0005', @cs_fund,
 'Classic MIT textbook exploring fundamental principles of programming using Scheme. Covers abstraction, recursion, and metalinguistic abstraction.', 2, 2),

('Concrete Mathematics', 'Ronald L. Graham, Donald E. Knuth, Oren Patashnik', 'Addison-Wesley', '9780201558029', 'BOOK-0006', @cs_fund,
 'Foundation for computer science mathematics — sums, recurrences, number theory, binomial coefficients, and generating functions.', 2, 2);

-- ── Software Development & Engineering ─────────────────────────────────────

INSERT IGNORE INTO books (title, author, publisher, isbn, barcode_id, category_id, description, total_copies, available_copies) VALUES
('Clean Code', 'Robert C. Martin', 'Prentice Hall', '9780132350884', 'BOOK-0007', @sw_eng,
 'A handbook of agile software craftsmanship. Teaches principles of writing clean, readable, and maintainable code.', 3, 3),

('The Pragmatic Programmer', 'David Thomas, Andrew Hunt', 'Addison-Wesley', '9780135957059', 'BOOK-0008', @sw_eng,
 'Classic guide from journeyman to master programmer. Covers practical advice on coding, debugging, and career development.', 3, 3),

('Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 'Addison-Wesley', '9780201633610', 'BOOK-0009', @sw_eng,
 'The seminal Gang of Four book defining 23 classic design patterns — creational, structural, and behavioral.', 2, 2),

('Refactoring: Improving the Design of Existing Code', 'Martin Fowler', 'Addison-Wesley', '9780134757599', 'BOOK-0010', @sw_eng,
 'Definitive guide to refactoring. Describes techniques for improving code structure without changing behavior.', 2, 2),

('Code Complete', 'Steve McConnell', 'Microsoft Press', '9780735619678', 'BOOK-0011', @sw_eng,
 'Comprehensive guide to software construction covering design, coding, debugging, and testing in practical detail.', 2, 2),

('The Mythical Man-Month', 'Frederick P. Brooks Jr.', 'Addison-Wesley', '9780201835953', 'BOOK-0012', @sw_eng,
 'Legendary essays on software engineering management. Introduces Brooks Law: adding people to a late project makes it later.', 3, 3),

('Software Architecture in Practice', 'Len Bass, Paul Clements, Rick Kazman', 'Addison-Wesley', '9780136886099', 'BOOK-0013', @sw_eng,
 'Comprehensive guide to software architecture covering quality attributes, architectural tactics, and documentation.', 2, 2),

('Microservices Patterns', 'Chris Richardson', 'Manning', '9781617294549', 'BOOK-0014', @sw_eng,
 'Practical patterns for developing microservice architectures including decomposition, communication, and data management.', 2, 2),

('Domain-Driven Design', 'Eric Evans', 'Addison-Wesley', '9780321125217', 'BOOK-0015', @sw_eng,
 'Foundational work on tackling complexity in software by connecting implementation to an evolving model of the domain.', 2, 2),

('Test Driven Development: By Example', 'Kent Beck', 'Addison-Wesley', '9780321146533', 'BOOK-0016', @sw_eng,
 'Introduces TDD through worked examples, demonstrating how to write tests first and refactor with confidence.', 2, 2);

-- ── AI/ML/DL/RL ────────────────────────────────────────────────────────────

INSERT IGNORE INTO books (title, author, publisher, isbn, barcode_id, category_id, description, total_copies, available_copies) VALUES
('Artificial Intelligence: A Modern Approach', 'Stuart Russell, Peter Norvig', 'Pearson', '9780134610993', 'BOOK-0017', @ai_ml,
 'The most widely used AI textbook worldwide. Covers search, logic, learning, planning, NLP, robotics, and more.', 3, 3),

('Pattern Recognition and Machine Learning', 'Christopher M. Bishop', 'Springer', '9780387310732', 'BOOK-0018', @ai_ml,
 'Graduate-level treatment of pattern recognition and machine learning with emphasis on Bayesian methods.', 2, 2),

('Deep Learning', 'Ian Goodfellow, Yoshua Bengio, Aaron Courville', 'MIT Press', '9780262035613', 'BOOK-0019', @ai_ml,
 'Comprehensive textbook covering deep learning fundamentals — CNNs, RNNs, GANs, optimization, and regularization.', 3, 3),

('Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow', 'Aurélien Géron', 'O''Reilly', '9781098125974', 'BOOK-0020', @ai_ml,
 'Practical guide to building ML systems using Python. Covers classification, regression, neural networks, and deployment.', 3, 3),

('Reinforcement Learning: An Introduction', 'Richard S. Sutton, Andrew G. Barto', 'MIT Press', '9780262039246', 'BOOK-0021', @ai_ml,
 'The definitive textbook on reinforcement learning — MDPs, temporal-difference learning, policy gradients, and deep RL.', 2, 2),

('The Hundred-Page Machine Learning Book', 'Andriy Burkov', 'Self-Published', '9781999579500', 'BOOK-0022', @ai_ml,
 'Concise yet comprehensive introduction to machine learning covering supervised, unsupervised, and deep learning.', 3, 3),

('Natural Language Processing with Transformers', 'Lewis Tunstall, Leandro von Werra, Thomas Wolf', 'O''Reilly', '9781098136796', 'BOOK-0023', @ai_ml,
 'Practical guide to NLP with Hugging Face Transformers — text classification, NER, question answering, and generation.', 2, 2),

('Computer Vision: Algorithms and Applications', 'Richard Szeliski', 'Springer', '9783030343712', 'BOOK-0024', @ai_ml,
 'Comprehensive textbook on computer vision covering image formation, feature detection, recognition, and 3D reconstruction.', 2, 2),

('Probabilistic Graphical Models', 'Daphne Koller, Nir Friedman', 'MIT Press', '9780262013192', 'BOOK-0025', @ai_ml,
 'Rigorous treatment of Bayesian networks, Markov random fields, and inference algorithms for probabilistic reasoning.', 1, 1),

('An Introduction to Computational Learning Theory', 'Michael J. Kearns, Umesh V. Vazirani', 'MIT Press', '9780262111935', 'BOOK-0026', @ai_ml,
 'Theoretical foundations of machine learning — PAC learning, VC dimension, and computational complexity of learning.', 1, 1);

-- ── Philosophy ─────────────────────────────────────────────────────────────

INSERT IGNORE INTO books (title, author, publisher, isbn, barcode_id, category_id, description, total_copies, available_copies) VALUES
('Thinking, Fast and Slow', 'Daniel Kahneman', 'Farrar, Straus and Giroux', '9780374533557', 'BOOK-0027', @philo,
 'Nobel laureate''s exploration of two systems of thinking — the fast intuitive System 1 and the slow deliberate System 2.', 3, 3),

('Gödel, Escher, Bach: An Eternal Golden Braid', 'Douglas R. Hofstadter', 'Basic Books', '9780465026562', 'BOOK-0028', @philo,
 'Pulitzer Prize-winning exploration of consciousness, AI, and the nature of meaning through math, art, and music.', 2, 2),

('The Mind''s I', 'Douglas Hofstadter, Daniel C. Dennett', 'Basic Books', '9780465030910', 'BOOK-0029', @philo,
 'Collection of essays and reflections on the nature of self, consciousness, and the philosophy of mind.', 2, 2),

('Superintelligence: Paths, Dangers, Strategies', 'Nick Bostrom', 'Oxford University Press', '9780198739838', 'BOOK-0030', @philo,
 'Explores the risks of artificial superintelligence and strategies for ensuring a beneficial outcome for humanity.', 2, 2),

('The Ethics of Artificial Intelligence', 'Shannon Vallor', 'Oxford University Press', '9780190905033', 'BOOK-0031', @philo,
 'Examines the ethical dimensions of AI including accountability, fairness, privacy, and the future of human values.', 2, 2),

('On Computing: The Fourth Great Scientific Domain', 'Peter Denning', 'MIT Press', '9780262018982', 'BOOK-0032', @philo,
 'Explores computing as a fundamental scientific discipline alongside physical, life, and social sciences.', 1, 1),

('Concrete Abstractions: An Intro to Computer Science Using Scheme', 'Max Hailperin, Barbara Kaiser, Karl Knight', 'Course Technology', '9780534952112', 'BOOK-0033', @philo,
 'Introduction to CS using Scheme that connects abstract concepts to concrete implementations and real-world applications.', 1, 1),

('Life 3.0: Being Human in the Age of Artificial Intelligence', 'Max Tegmark', 'Vintage', '9781101970317', 'BOOK-0034', @philo,
 'Explores how AI will transform crime, war, justice, jobs, society, and our sense of being human.', 3, 3),

('The Master Algorithm', 'Pedro Domingos', 'Basic Books', '9780465065707', 'BOOK-0035', @philo,
 'Explores the quest for the one algorithm that can learn anything — unifying all machine learning paradigms.', 2, 2),

('Reasons and Persons', 'Derek Parfit', 'Oxford University Press', '9780198249085', 'BOOK-0036', @philo,
 'Groundbreaking philosophical work on personal identity, rationality, and ethics that has profoundly influenced modern philosophy.', 1, 1);

-- ── Web Development & Backend ──────────────────────────────────────────────

INSERT IGNORE INTO books (title, author, publisher, isbn, barcode_id, category_id, description, total_copies, available_copies) VALUES
('Full Stack JavaScript', 'David Herron', 'Packt', '9781788622301', 'BOOK-0037', @webdev,
 'Comprehensive guide to building full-stack applications with JavaScript on both client and server.', 2, 2),

('Learning HTTP/2', 'Stephen Ludin, Javier Garza', 'O''Reilly', '9781491962442', 'BOOK-0038', @webdev,
 'Practical guide to the HTTP/2 protocol — multiplexing, server push, header compression, and performance optimization.', 2, 2),

('The Web Application Hacker''s Handbook', 'Dafydd Stuttard, Marcus Pinto', 'Wiley', '9781118026472', 'BOOK-0039', @webdev,
 'Comprehensive guide to finding and exploiting web application vulnerabilities — SQL injection, XSS, CSRF, and more.', 2, 2),

('Python Crash Course', 'Eric Matthes', 'No Starch Press', '9781718502703', 'BOOK-0040', @webdev,
 'Fast-paced introduction to Python covering fundamentals, projects (games, data visualization, web apps).', 3, 3),

('Flask Web Development', 'Miguel Grinberg', 'O''Reilly', '9781491991732', 'BOOK-0041', @webdev,
 'Comprehensive guide to building web applications with Flask, covering templates, databases, REST APIs, and deployment.', 2, 2),

('Essential SQLAlchemy', 'Jason Myers, Rick Copeland', 'O''Reilly', '9781491916469', 'BOOK-0042', @webdev,
 'Practical guide to SQLAlchemy ORM and Core — mapping, querying, sessions, and real-world patterns.', 2, 2),

('REST API Design Rulebook', 'Mark Masse', 'O''Reilly', '9781449310509', 'BOOK-0043', @webdev,
 'Concise guide to designing REST APIs that are consistent, discoverable, and well-structured.', 2, 2),

('GraphQL in Action', 'Samer Buna', 'Manning', '9781617295683', 'BOOK-0044', @webdev,
 'Practical guide to building GraphQL APIs — schema design, resolvers, subscriptions, and client integration.', 2, 2);

-- ── Database & Data Structures ─────────────────────────────────────────────

INSERT IGNORE INTO books (title, author, publisher, isbn, barcode_id, category_id, description, total_copies, available_copies) VALUES
('Database System Concepts', 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan', 'McGraw-Hill', '9780078022159', 'BOOK-0045', @db_ds,
 'Comprehensive database textbook covering relational model, SQL, normalization, transactions, concurrency, and recovery.', 3, 3),

('Designing Data-Intensive Applications', 'Martin Kleppmann', 'O''Reilly', '9781449373320', 'BOOK-0046', @db_ds,
 'Essential guide to building reliable and scalable data systems — replication, partitioning, encoding, and stream processing.', 3, 3),

('Elasticsearch in Action', 'Radu Gheorghe, Matthew Lee Hinman, Roy Russo', 'Manning', '9781617291623', 'BOOK-0047', @db_ds,
 'Practical guide to Elasticsearch — indexing, searching, aggregations, and building search-powered applications.', 2, 2),

('SQL Performance Explained', 'Markus Winand', 'Self-Published', '9783950307825', 'BOOK-0048', @db_ds,
 'Deep dive into SQL performance — indexes, joins, query plans, and optimization strategies explained with clarity.', 2, 2);

-- ── Advanced Topics ────────────────────────────────────────────────────────

INSERT IGNORE INTO books (title, author, publisher, isbn, barcode_id, category_id, description, total_copies, available_copies) VALUES
('Compilers: Principles, Techniques, and Tools', 'Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman', 'Pearson', '9780321486813', 'BOOK-0049', @adv,
 'The legendary Dragon Book — covers lexical analysis, parsing, semantic analysis, optimization, and code generation.', 2, 2),

('Operating System Concepts', 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne', 'Wiley', '9781119800361', 'BOOK-0050', @adv,
 'Comprehensive OS textbook covering processes, threads, synchronization, memory management, file systems, and security.', 3, 3),

('Computer Networking: A Top-Down Approach', 'James F. Kurose, Keith W. Ross', 'Pearson', '9780136681557', 'BOOK-0051', @adv,
 'Popular networking textbook using a top-down approach — application layer down to physical layer, with Wireshark labs.', 3, 3),

('Cryptography and Network Security', 'William Stallings', 'Pearson', '9780134444284', 'BOOK-0052', @adv,
 'Comprehensive coverage of cryptographic algorithms, protocols, and network security — AES, RSA, TLS, IPSec, and more.', 2, 2);

-- ============================================================================

SELECT CONCAT('Seeded ', COUNT(*), ' books across ', 
    (SELECT COUNT(*) FROM categories), ' categories') AS result 
FROM books;
