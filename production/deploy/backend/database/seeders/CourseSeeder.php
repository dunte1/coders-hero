<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $instructors = User::role('instructor')->get();
        $categories = Category::all();

        $courses = [
            [
                'title' => 'Complete Laravel 12 Masterclass',
                'description' => 'Master Laravel 12 from scratch. Learn routing, controllers, views, Eloquent ORM, authentication, API development, testing, and deployment.',
                'objectives' => ['Understand Laravel 12 fundamentals', 'Build RESTful APIs', 'Implement authentication', 'Write tests', 'Deploy applications'],
                'prerequisites' => ['Basic PHP knowledge', 'HTML/CSS basics'],
                'category' => 'Web Development',
                'instructor_index' => 0,
                'level' => 'beginner',
                'duration_hours' => 40.0,
                'price' => 99.99,
                'is_featured' => true,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'Getting Started',
                        'lessons' => [
                            ['title' => 'Introduction to Laravel 12', 'content' => "Laravel is a web application framework with expressive, elegant syntax. In this lesson, you'll learn what Laravel is, why it's popular, and what you'll build throughout this course.\n\n## What is Laravel?\n\nLaravel is a free, open-source PHP web framework created by Taylor Otwell. It follows the MVC (Model-View-Controller) architectural pattern.\n\n## Key Features\n- **Eloquent ORM**: Beautiful Active Record implementation\n- **Blade Templating**: Powerful yet simple templating engine\n- **Artisan CLI**: Command-line tool for tasks\n- **Built-in Authentication**: Ready-to-use auth system\n- **Testing Support**: First-class PHPUnit integration", 'type' => 'video', 'duration_minutes' => 30, 'is_free' => true],
                            ['title' => 'Setting Up Your Environment', 'content' => "Before writing code, you need the right tools installed.\n\n## Required Software\n\n1. **PHP 8.3+** - Laravel 12 requires PHP 8.3 or higher\n2. **Composer** - PHP dependency manager\n3. **Node.js & NPM** - For frontend assets\n4. **MySQL/SQLite** - Database\n\n## Installation Steps\n\n```bash\n# Install Laravel via Composer\ncomposer create-project laravel/laravel my-app\n\n# Navigate to project\ncd my-app\n\n# Start the development server\nphp artisan serve\n```\n\nOpen http://localhost:8000 in your browser to see the welcome page.", 'type' => 'text', 'duration_minutes' => 45],
                        ],
                    ],
                    [
                        'title' => 'Core Concepts',
                        'lessons' => [
                            ['title' => 'Routing Basics', 'content' => "Routes tell Laravel what URL to respond to and what code to execute.\n\n## Basic Routes\n\n```php\n// routes/web.php\nuse Illuminate\\Support\\Facades\\Route;\n\nRoute::get('/', function () {\n    return view('welcome');\n});\n\nRoute::get('/about', function () {\n    return 'About Page';\n});\n```\n\n## Route Parameters\n\n```php\nRoute::get('/user/{id}', function (\$id) {\n    return 'User ' . \$id;\n});\n```\n\n## Named Routes\n\n```php\nRoute::get('/dashboard', function () {\n    // ...\n})->name('dashboard');\n\n// In Blade: {{ route('dashboard') }}\n```", 'type' => 'video', 'duration_minutes' => 60],
                            ['title' => 'Controllers and Views', 'content' => "Controllers organize your application logic. Views display the UI.\n\n## Creating a Controller\n\n```bash\nphp artisan make:controller PostController\n```\n\n## Controller Example\n\n```php\nclass PostController extends Controller\n{\n    public function index()\n    {\n        \$posts = Post::all();\n        return view('posts.index', compact('posts'));\n    }\n\n    public function show(Post \$post)\n    {\n        return view('posts.show', compact('post'));\n    }\n}\n```\n\n## Blade Views\n\n```blade\n{{-- resources/views/posts/index.blade.php --}}\n@extends('layouts.app')\n\n@section('content')\n    @foreach(\$posts as \$post)\n        <h2>{{ \$post->title }}</h2>\n    @endforeach\n@endsection\n```", 'type' => 'video', 'duration_minutes' => 55],
                            ['title' => 'Eloquent ORM', 'content' => "Eloquent provides a beautiful ActiveRecord implementation for working with databases.\n\n## Models\n\n```php\nclass Post extends Model\n{\n    protected \$fillable = ['title', 'content'];\n\n    public function author()\n    {\n        return \$this->belongsTo(User::class);\n    }\n}\n```\n\n## CRUD Operations\n\n```php\n// Create\nPost::create(['title' => 'Hello', 'content' => 'World']);\n\n// Read\n\$posts = Post::where('active', true)->get();\n\n// Update\n\$post->update(['title' => 'Updated']);\n\n// Delete\n\$post->delete();\n```\n\n## Relationships\n\n```php\n// One-to-Many\n\$user->posts; // Collection of posts\n\n// Many-to-Many\n\$role->users;\n```", 'type' => 'video', 'duration_minutes' => 70],
                        ],
                    ],
                    [
                        'title' => 'Advanced Topics',
                        'lessons' => [
                            ['title' => 'Authentication', 'content' => "Laravel provides a complete authentication system out of the box.\n\n## Quick Setup\n\n```bash\nphp artisan make:auth\n```\n\n## Laravel Breeze\n\n```bash\ncomposer require laravel/breeze --dev\nphp artisan breeze:install\nnpm install && npm run build\nphp artisan migrate\n```\n\n## Protecting Routes\n\n```php\nRoute::middleware('auth')->group(function () {\n    Route::get('/dashboard', [DashboardController::class, 'index']);\n});\n```\n\n## Sanctum for API Auth\n\n```bash\ncomposer require laravel/sanctum\n```\n\nSanctum provides token-based authentication for SPAs and mobile apps.", 'type' => 'video', 'duration_minutes' => 50],
                            ['title' => 'API Development', 'content' => "Build RESTful APIs with Laravel.\n\n## API Routes\n\n```php\n// routes/api.php\nRoute::apiResource('posts', PostController::class);\n```\n\n## API Resources\n\n```php\nclass PostResource extends JsonResource\n{\n    public function toArray(\$request)\n    {\n        return [\n            'id' => \$this->id,\n            'title' => \$this->title,\n            'content' => \$this->content,\n            'author' => new UserResource(\$this->author),\n        ];\n    }\n}\n```\n\n## API Responses\n\n```php\nreturn PostResource::collection(\$posts);\nreturn new PostResource(\$post);\n```", 'type' => 'video', 'duration_minutes' => 65],
                            ['title' => 'Testing', 'content' => "Laravel provides excellent testing support with PHPUnit.\n\n## Feature Test Example\n\n```php\nclass PostTest extends TestCase\n{\n    use RefreshDatabase;\n\n    public function test_can_create_post(): void\n    {\n        \$user = User::factory()->create();\n\n        \$response = \$this->actingAs(\$user)\n            ->post('/api/posts', [\n                'title' => 'Test Post',\n                'content' => 'Test content',\n            ]);\n\n        \$response->assertStatus(201);\n        \$this->assertDatabaseHas('posts', [\n            'title' => 'Test Post',\n        ]);\n    }\n}\n```\n\n## Running Tests\n\n```bash\nphp artisan test\nphp artisan test --filter=PostTest\n```", 'type' => 'text', 'duration_minutes' => 40],
                            ['title' => 'Laravel Final Exam', 'content' => 'Test your knowledge of Laravel 12 concepts covered in this course.', 'type' => 'quiz', 'duration_minutes' => 30],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'React & TypeScript Advanced Patterns',
                'description' => 'Deep dive into advanced React patterns with TypeScript. Learn custom hooks, HOCs, render props, compound components, state machines, and performance optimization.',
                'objectives' => ['Master advanced React patterns', 'Use TypeScript effectively', 'Optimize performance', 'Build scalable applications'],
                'prerequisites' => ['React basics', 'TypeScript basics', 'JavaScript ES6+'],
                'category' => 'Web Development',
                'instructor_index' => 1,
                'level' => 'advanced',
                'duration_hours' => 35.0,
                'price' => 129.99,
                'is_featured' => true,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'TypeScript in React',
                        'lessons' => [
                            ['title' => 'TypeScript Fundamentals for React', 'content' => "TypeScript adds static type checking to JavaScript, catching errors at compile time.\n\n## Props Typing\n\n```tsx\ninterface ButtonProps {\n  label: string;\n  onClick: () => void;\n  variant?: 'primary' | 'secondary';\n}\n\nconst Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {\n  return <button className={`btn btn-\${variant}`}>{label}</button>;\n};\n```\n\n## Generic Components\n\n```tsx\ninterface ListProps<T> {\n  items: T[];\n  renderItem: (item: T) => React.ReactNode;\n}\n\nfunction List<T>({ items, renderItem }: ListProps<T>) {\n  return <div>{items.map(renderItem)}</div>;\n}\n```", 'type' => 'video', 'duration_minutes' => 45, 'is_free' => true],
                            ['title' => 'Advanced Component Patterns', 'content' => "Learn patterns for building flexible, reusable components.\n\n## Compound Components\n\n```tsx\nconst Tabs = ({ children }) => {\n  const [active, setActive] = useState(0);\n  return React.Children.map(children, (child, i) =>\n    React.cloneElement(child, { active: i === active, onSelect: () => setActive(i) })\n  );\n};\n\nTabs.Panel = ({ active, children }) => active ? <div>{children}</div> : null;\n```\n\n## Render Props\n\n```tsx\n<MouseTracker render={(pos) => <Crosshair x={pos.x} y={pos.y} />} />\n```", 'type' => 'video', 'duration_minutes' => 60],
                        ],
                    ],
                    [
                        'title' => 'Performance & State',
                        'lessons' => [
                            ['title' => 'Custom Hooks Deep Dive', 'content' => "Custom hooks extract component logic into reusable functions.\n\n## useDebounce Hook\n\n```tsx\nfunction useDebounce<T>(value: T, delay: number): T {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}\n```\n\n## useLocalStorage Hook\n\n```tsx\nfunction useLocalStorage<T>(key: string, initial: T) {\n  const [val, setVal] = useState<T>(() => {\n    const saved = localStorage.getItem(key);\n    return saved ? JSON.parse(saved) : initial;\n  });\n  useEffect(() => localStorage.setItem(key, JSON.stringify(val)), [key, val]);\n  return [val, setVal] as const;\n}\n```", 'type' => 'video', 'duration_minutes' => 55],
                            ['title' => 'Performance Optimization', 'content' => "React performance tips to keep your app fast.\n\n## React.memo\n\n```tsx\nconst ExpensiveComponent = React.memo(({ data }) => {\n  return <div>{/* complex rendering */}</div>;\n});\n```\n\n## useMemo and useCallback\n\n```tsx\nconst memoized = useMemo(() => computeExpensive(a, b), [a, b]);\nconst handler = useCallback(() => doSomething(id), [id]);\n```\n\n## Code Splitting\n\n```tsx\nconst HeavyPage = lazy(() => import('./HeavyPage'));\n\n<Suspense fallback={<Spinner />}>\n  <HeavyPage />\n</Suspense>\n```", 'type' => 'text', 'duration_minutes' => 40],
                            ['title' => 'State Management Patterns', 'content' => "Advanced patterns for managing application state.\n\n## useReducer Pattern\n\n```tsx\nconst [state, dispatch] = useReducer(reducer, initialState);\n\nfunction reducer(state, action) {\n  switch (action.type) {\n    case 'INCREMENT': return { ...state, count: state.count + 1 };\n    default: return state;\n  }\n}\n```\n\n## Context + useReducer\n\n```tsx\nconst StateContext = createContext();\nconst DispatchContext = createContext();\n\nfunction AppProvider({ children }) {\n  const [state, dispatch] = useReducer(reducer, initialState);\n  return (\n    <StateContext.Provider value={state}>\n      <DispatchContext.Provider value={dispatch}>\n        {children}\n      </DispatchContext.Provider>\n    </StateContext.Provider>\n  );\n}\n```", 'type' => 'video', 'duration_minutes' => 50],
                            ['title' => 'React Final Assessment', 'content' => 'Comprehensive assessment covering all advanced React and TypeScript topics.', 'type' => 'quiz', 'duration_minutes' => 45],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Python for Data Science',
                'description' => 'Learn Python programming for data science. Cover NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn, and basic machine learning concepts.',
                'objectives' => ['Learn Python for data analysis', 'Master NumPy and Pandas', 'Create data visualizations', 'Build ML models'],
                'prerequisites' => ['Basic programming knowledge'],
                'category' => 'Data Science',
                'instructor_index' => 2,
                'level' => 'intermediate',
                'duration_hours' => 45.0,
                'price' => 149.99,
                'is_featured' => true,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'Python Review',
                        'lessons' => [
                            ['title' => 'Python Basics Review', 'content' => "Quick Python refresher covering variables, loops, functions, and list comprehensions.\n\n## Variables & Types\n\n```python\nname = 'Alice'  # string\nage = 25  # integer\ngpa = 3.8  # float\nis_student = True  # boolean\n```\n\n## List Comprehensions\n\n```python\nsquares = [x**2 for x in range(10)]\nevens = [x for x in range(20) if x % 2 == 0]\n```", 'type' => 'video', 'duration_minutes' => 40, 'is_free' => true],
                        ],
                    ],
                    [
                        'title' => 'Data Analysis',
                        'lessons' => [
                            ['title' => 'NumPy Arrays', 'content' => "NumPy provides efficient array operations for numerical computing.\n\n## Creating Arrays\n\n```python\nimport numpy as np\n\narr = np.array([1, 2, 3, 4, 5])\nmatrix = np.zeros((3, 3))\nrandom_arr = np.random.randn(100)\n```\n\n## Operations\n\n```python\narr.mean()  # Mean\narr.std()   # Standard deviation\nnp.dot(a, b)  # Dot product\n```", 'type' => 'video', 'duration_minutes' => 55],
                            ['title' => 'Pandas DataFrames', 'content' => "Pandas is the essential tool for data manipulation in Python.\n\n## Loading Data\n\n```python\nimport pandas as pd\n\ndf = pd.read_csv('data.csv')\ndf.head()\n```\n\n## Filtering & Selection\n\n```python\ndf[df['age'] > 25]\ndf[['name', 'score']]\ndf.groupby('category').mean()\n```\n\n## Cleaning\n\n```python\ndf.dropna()\ndf.fillna(0)\ndf.drop_duplicates()\n```", 'type' => 'video', 'duration_minutes' => 65],
                            ['title' => 'Data Visualization', 'content' => "Create compelling charts with Matplotlib and Seaborn.\n\n```python\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Line plot\nplt.plot(x, y)\nplt.title('Sales Trend')\nplt.show()\n\n# Seaborn heatmap\nsns.heatmap(df.corr(), annot=True)\n\n# Histogram\nsns.histplot(data=df, x='age', hue='gender')\n```", 'type' => 'video', 'duration_minutes' => 50],
                        ],
                    ],
                    [
                        'title' => 'Machine Learning',
                        'lessons' => [
                            ['title' => 'Introduction to ML', 'content' => "Machine learning is a subset of AI that learns patterns from data.\n\n## Types of ML\n- **Supervised**: Labeled data (classification, regression)\n- **Unsupervised**: No labels (clustering, dimensionality reduction)\n- **Reinforcement**: Learning through rewards\n\n## Scikit-learn Workflow\n\n```python\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\n\nX_train, X_test, y_train, y_test = train_test_split(X, y)\nmodel = RandomForestClassifier()\nmodel.fit(X_train, y_train)\nmodel.score(X_test, y_test)\n```", 'type' => 'text', 'duration_minutes' => 45],
                            ['title' => 'Data Science Project', 'content' => 'Hands-on project applying all data science concepts learned in this course.', 'type' => 'assignment', 'duration_minutes' => 120],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Docker & Kubernetes for DevOps',
                'description' => 'Master containerization with Docker and orchestration with Kubernetes. Learn CI/CD pipelines, microservices deployment, and cloud-native development.',
                'objectives' => ['Master Docker containers', 'Deploy with Kubernetes', 'Set up CI/CD', 'Manage microservices'],
                'prerequisites' => ['Linux basics', 'Command line proficiency'],
                'category' => 'Cloud & DevOps',
                'instructor_index' => 0,
                'level' => 'intermediate',
                'duration_hours' => 30.0,
                'price' => 119.99,
                'is_featured' => false,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'Docker Fundamentals',
                        'lessons' => [
                            ['title' => 'Introduction to Containers', 'content' => "Containers package applications with their dependencies for consistent deployment.\n\n## Containers vs VMs\n- Containers share the host OS kernel\n- Lightweight and fast to start\n- Isolated but portable\n\n## Docker Basics\n\n```bash\n# Pull an image\ndocker pull nginx\n\n# Run a container\ndocker run -d -p 80:80 nginx\n\n# List running containers\ndocker ps\n```", 'type' => 'video', 'duration_minutes' => 35, 'is_free' => true],
                            ['title' => 'Docker Fundamentals', 'content' => "Dockerfiles define how to build container images.\n\n## Dockerfile Example\n\n```dockerfile\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]\n```\n\n## Docker Commands\n\n```bash\ndocker build -t myapp .\ndocker run -p 3000:3000 myapp\ndocker logs <container_id>\n```", 'type' => 'video', 'duration_minutes' => 50],
                            ['title' => 'Docker Compose', 'content' => "Docker Compose manages multi-container applications.\n\n## docker-compose.yml\n\n```yaml\nversion: '3.8'\nservices:\n  web:\n    build: .\n    ports:\n      - \"3000:3000\"\n    depends_on:\n      - db\n  db:\n    image: mysql:8.0\n    environment:\n      MYSQL_ROOT_PASSWORD: secret\n```\n\n## Commands\n\n```bash\ndocker-compose up -d\ndocker-compose down\ndocker-compose logs\n```", 'type' => 'video', 'duration_minutes' => 45],
                            ['title' => 'Kubernetes Basics', 'content' => "Kubernetes orchestrates container deployment at scale.\n\n## Core Concepts\n- **Pod**: Smallest deployable unit\n- **Deployment**: Manages pod replicas\n- **Service**: Network access to pods\n- **Ingress**: External HTTP routing\n\n## kubectl Commands\n\n```bash\nkubectl get pods\nkubectl describe pod <name>\nkubectl logs <pod>\nkubectl scale deployment web --replicas=3\n```", 'type' => 'video', 'duration_minutes' => 60],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'UX Design Principles',
                'description' => 'Learn the fundamentals of user experience design. Cover research methods, wireframing, prototyping, usability testing, and design systems.',
                'objectives' => ['Understand UX principles', 'Conduct user research', 'Create wireframes and prototypes', 'Conduct usability tests'],
                'prerequisites' => ['None'],
                'category' => 'Design',
                'instructor_index' => 2,
                'level' => 'beginner',
                'duration_hours' => 25.0,
                'price' => 79.99,
                'is_featured' => false,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'UX Fundamentals',
                        'lessons' => [
                            ['title' => 'What is UX Design?', 'content' => "UX Design is about creating products that provide meaningful experiences.\n\n## Core UX Principles\n1. **Usability**: Easy to learn and use\n2. **Accessibility**: Usable by everyone\n3. **Desirability**: Pleasant and engaging\n4. **Findability**: Easy to find what you need\n5. **Credibility**: Trustworthy and reliable\n\n## UX vs UI\n- UX = overall experience\n- UI = visual interface design", 'type' => 'video', 'duration_minutes' => 25, 'is_free' => true],
                            ['title' => 'User Research Methods', 'content' => "Understanding users is the foundation of good design.\n\n## Research Methods\n- **Interviews**: One-on-one conversations\n- **Surveys**: Large-scale data collection\n- **Observation**: Watch users interact\n- **Analytics**: Quantitative behavioral data\n\n## Personas\n\n```markdown\n## Persona: Sarah, 28\n- Marketing manager\n- Tech-savvy\n- Goals: Save time on reporting\n- Pain points: Complex dashboards\n```", 'type' => 'text', 'duration_minutes' => 40],
                            ['title' => 'Wireframing', 'content' => "Wireframes are low-fidelity layouts showing page structure.\n\n## Types of Wireframes\n- **Low-fidelity**: Sketches, paper drawings\n- **Mid-fidelity**: Basic digital layouts\n- **High-fidelity**: Detailed mockups\n\n## Tools\n- Figma (recommended)\n- Sketch\n- Adobe XD\n- Balsamiq\n\n## Best Practices\n1. Focus on layout, not colors\n2. Use placeholders for images\n3. Show content hierarchy\n4. Include annotations", 'type' => 'video', 'duration_minutes' => 45],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Scratch Coding Adventures',
                'description' => 'Introduction to programming through Scratch. Learn block-based coding, create animations, games, and interactive stories. Perfect for beginners aged 5-10.',
                'objectives' => ['Understand block-based programming', 'Create animations', 'Build simple games', 'Learn computational thinking'],
                'prerequisites' => ['None'],
                'category' => 'Coding',
                'instructor_index' => 0,
                'level' => 'beginner',
                'duration_hours' => 20.0,
                'price' => 49.99,
                'is_featured' => true,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'Getting Started',
                        'lessons' => [
                            ['title' => 'Getting Started with Scratch', 'content' => "Scratch is a visual programming language developed by MIT.\n\n## The Scratch Interface\n- **Stage**: Where your project plays\n- **Sprites**: Characters and objects\n- **Scripts**: Stacks of blocks\n- **Costumes**: Different looks for sprites\n\n## Your First Script\n1. Click the 'Events' category\n2. Drag 'when green flag clicked' to the scripts area\n3. Click 'Looks' category\n4. Drag 'say Hello! for 2 seconds'\n5. Click the green flag to run!", 'type' => 'video', 'duration_minutes' => 20, 'is_free' => true],
                            ['title' => 'Moving Sprites', 'content' => "Make your sprites move and animate!\n\n## Movement Blocks\n- **move 10 steps**: Move sprite forward\n- **turn 15 degrees**: Rotate sprite\n- **go to x: y:**: Move to position\n- **glide 1 secs to x: y:**: Smooth movement\n\n## Example: Bouncing Ball\n```\nwhen green flag clicked\nforever\n  move 10 steps\n  if on edge, bounce\nend\n```", 'type' => 'video', 'duration_minutes' => 30],
                        ],
                    ],
                    [
                        'title' => 'Creative Projects',
                        'lessons' => [
                            ['title' => 'Sound and Music', 'content' => "Add sounds and music to make your projects come alive!\n\n## Sound Blocks\n- **play sound until done**: Play a full sound\n- **start sound**: Play without waiting\n- **change volume by**: Adjust volume\n- **set pitch to**: Change pitch\n\n## Recording Sounds\n1. Click the Sounds tab\n2. Click 'Record'\n3. Record your voice or music\n4. Use it in your scripts!", 'type' => 'video', 'duration_minutes' => 25],
                            ['title' => 'Building a Simple Game', 'content' => "Let's build a simple catch game!\n\n## Game Concept\n- Apple falls from top\n- Basket moves left/right\n- Score increases when caught\n\n## Key Concepts\n1. **Variables**: Store score\n2. **Loops**: Make apple fall repeatedly\n3. **Conditionals**: Check for collision\n4. **Events**: Detect key presses", 'type' => 'video', 'duration_minutes' => 40],
                            ['title' => 'Scratch Project', 'content' => 'Build your own Scratch project! Choose from: animation, game, or interactive story. Apply everything you learned in this course.', 'type' => 'assignment', 'duration_minutes' => 60],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Blockly Visual Programming',
                'description' => 'Learn programming concepts through Google Blockly. Understand logic, loops, variables, and functions using visual blocks.',
                'objectives' => ['Understand programming logic', 'Use loops and conditionals', 'Work with variables', 'Build simple programs'],
                'prerequisites' => ['Basic computer skills'],
                'category' => 'Coding',
                'instructor_index' => 1,
                'level' => 'beginner',
                'duration_hours' => 15.0,
                'price' => 39.99,
                'is_featured' => false,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'Blockly Basics',
                        'lessons' => [
                            ['title' => 'Introduction to Blockly', 'content' => "Blockly is a library for building visual programming editors.\n\n## What is Blockly?\n- Drag-and-drop code blocks\n- Visual representation of code\n- No syntax errors possible\n- Used in Scratch, App Inventor, and more\n\n## Block Categories\n- **Logic**: if/else, comparisons\n- **Loops**: repeat, while\n- **Math**: arithmetic, random numbers\n- **Variables**: store and use values", 'type' => 'video', 'duration_minutes' => 15, 'is_free' => true],
                            ['title' => 'Sequential Logic', 'content' => "Code executes line by line, top to bottom.\n\n## Sequential Execution\n```\ndo something\nthen do the next thing\nthen do the last thing\n```\n\n## Real-world Analogy\nLike following a recipe:\n1. Preheat oven\n2. Mix ingredients\n3. Pour into pan\n4. Bake for 30 minutes", 'type' => 'video', 'duration_minutes' => 25],
                            ['title' => 'Loops and Repetition', 'content' => "Loops repeat actions multiple times.\n\n## Types of Loops\n- **Repeat N times**: Fixed number\n- **Repeat while**: Condition-based\n- **For each**: Iterate over items\n\n## Example\n```\nrepeat 10 times\n  move 10 steps\n  turn 36 degrees\nend\n```\nThis makes a square!", 'type' => 'video', 'duration_minutes' => 30],
                            ['title' => 'Conditionals', 'content' => "Conditionals make decisions in code.\n\n## If-Else Structure\n```\nif temperature > 30 then\n  say \"It's hot!\"\nelse\n  say \"It's nice!\"\nend\n```\n\n## Comparison Operators\n- = (equals)\n- > (greater than)\n- < (less than)\n- != (not equal)", 'type' => 'video', 'duration_minutes' => 30],
                            ['title' => 'Variables and Functions', 'content' => "Variables store data. Functions organize code.\n\n## Variables\n```\nset score to 0\nchange score by 1\n```\n\n## Functions (Procedures)\n```\nprocedure drawSquare\n  repeat 4 times\n    move 50 steps\n    turn 90 degrees\n  end\nend\n\ncall drawSquare\n```", 'type' => 'video', 'duration_minutes' => 35],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'HTML & Web Fundamentals',
                'description' => 'Learn to build websites from scratch with HTML and CSS. Understand semantic HTML, forms, layouts, and responsive design.',
                'objectives' => ['Write HTML5 markup', 'Style with CSS', 'Build responsive layouts', 'Create forms and tables'],
                'prerequisites' => ['Basic computer skills'],
                'category' => 'Web Development',
                'instructor_index' => 0,
                'level' => 'beginner',
                'duration_hours' => 25.0,
                'price' => 59.99,
                'is_featured' => true,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'HTML Basics',
                        'lessons' => [
                            ['title' => 'Introduction to HTML', 'content' => "HTML (HyperText Markup Language) structures web content.\n\n## Your First HTML Page\n```html\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <p>This is my first webpage.</p>\n</body>\n</html>\n```\n\n## How the Web Works\n1. Browser requests a URL\n2. Server sends HTML\n3. Browser renders the page", 'type' => 'video', 'duration_minutes' => 20, 'is_free' => true],
                            ['title' => 'HTML Elements and Tags', 'content' => "HTML uses tags to define elements.\n\n## Common Tags\n- Headings: `<h1>` to `<h6>`\n- Paragraphs: `<p>`\n- Links: `<a href=\"url\">`\n- Images: `<img src=\"url\" alt=\"text\">`\n- Lists: `<ul>`, `<ol>`, `<li>`\n\n## Semantic HTML\n```html\n<header>Site header</header>\n<nav>Navigation</nav>\n<main>Content</main>\n<footer>Footer</footer>\n```", 'type' => 'video', 'duration_minutes' => 35],
                        ],
                    ],
                    [
                        'title' => 'CSS Styling',
                        'lessons' => [
                            ['title' => 'CSS Basics', 'content' => "CSS styles HTML elements.\n\n## Three Ways to Add CSS\n1. **Inline**: `<p style=\"color: red;\">`\n2. **Internal**: `<style>` in `<head>`\n3. **External**: `<link rel=\"stylesheet\" href=\"style.css\">`\n\n## Selectors\n```css\nh1 { color: blue; }       /* element */\n.class { font-size: 16px; } /* class */\n#id { margin: 10px; }      /* id */\n```", 'type' => 'video', 'duration_minutes' => 40],
                            ['title' => 'Layout with Flexbox', 'content' => "Flexbox makes layouts easy.\n\n```css\n.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1rem;\n}\n\n.item {\n  flex: 1; /* equal width */\n}\n```\n\n## Flex Properties\n- **flex-direction**: row/column\n- **justify-content**: horizontal alignment\n- **align-items**: vertical alignment\n- **flex-wrap**: wrap items", 'type' => 'video', 'duration_minutes' => 45],
                            ['title' => 'Responsive Design', 'content' => "Make sites work on all devices with media queries.\n\n```css\n/* Mobile first */\n.container {\n  padding: 1rem;\n}\n\n/* Tablet */\n@media (min-width: 768px) {\n  .container {\n    padding: 2rem;\n  }\n}\n\n/* Desktop */\n@media (min-width: 1024px) {\n  .container {\n    max-width: 1200px;\n    margin: 0 auto;\n  }\n}\n```", 'type' => 'video', 'duration_minutes' => 40],
                            ['title' => 'Build a Portfolio Site', 'content' => 'Create your own portfolio website using HTML and CSS. Include: header, about section, projects grid, and contact form.', 'type' => 'assignment', 'duration_minutes' => 90],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'CSS Mastery & Animations',
                'description' => 'Advanced CSS techniques including animations, transitions, grid layouts, custom properties, and modern CSS frameworks.',
                'objectives' => ['Master CSS Grid and Flexbox', 'Create animations', 'Use CSS custom properties', 'Build complex layouts'],
                'prerequisites' => ['HTML & CSS basics'],
                'category' => 'Web Development',
                'instructor_index' => 1,
                'level' => 'intermediate',
                'duration_hours' => 20.0,
                'price' => 69.99,
                'is_featured' => false,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'Advanced CSS',
                        'lessons' => [
                            ['title' => 'Advanced Selectors', 'content' => "CSS specificity and advanced selectors.\n\n## Specificity Hierarchy\n1. Inline styles (1000)\n2. IDs (100)\n3. Classes/attributes (10)\n4. Elements (1)\n\n## Advanced Selectors\n```css\n/* Child selector */\nul > li { }\n\n/* Adjacent sibling */\nh2 + p { }\n\n/* Attribute selector */\na[href^=\"https\"] { }\n```", 'type' => 'video', 'duration_minutes' => 30, 'is_free' => true],
                            ['title' => 'CSS Grid Deep Dive', 'content' => "CSS Grid for two-dimensional layouts.\n\n```css\n.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-gap: 1rem;\n}\n\n/* Span columns */\n.wide {\n  grid-column: span 2;\n}\n\n/* Named areas */\n.layout {\n  grid-template-areas:\n    \"header header\"\n    \"sidebar main\"\n    \"footer footer\";\n}\n```", 'type' => 'video', 'duration_minutes' => 45],
                            ['title' => 'Animations & Transitions', 'content' => "Create smooth animations with CSS.\n\n## Transitions\n```css\n.button {\n  background: blue;\n  transition: background 0.3s ease;\n}\n.button:hover {\n  background: darkblue;\n}\n```\n\n## Keyframe Animations\n```css\n@keyframes slide-in {\n  from { transform: translateX(-100%); }\n  to { transform: translateX(0); }\n}\n\n.animated {\n  animation: slide-in 0.5s ease-out;\n}\n```", 'type' => 'video', 'duration_minutes' => 40],
                            ['title' => 'CSS Custom Properties', 'content' => "CSS variables for maintainable styles.\n\n```css\n:root {\n  --primary: #3b82f6;\n  --spacing: 1rem;\n  --radius: 0.5rem;\n}\n\n.button {\n  background: var(--primary);\n  padding: var(--spacing);\n  border-radius: var(--radius);\n}\n```", 'type' => 'video', 'duration_minutes' => 25],
                            ['title' => 'Responsive Projects', 'content' => 'Build responsive layouts using CSS Grid, Flexbox, and media queries.', 'type' => 'assignment', 'duration_minutes' => 60],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'JavaScript for Beginners',
                'description' => 'Learn JavaScript from scratch. Cover variables, functions, DOM manipulation, events, APIs, and modern ES6+ features.',
                'objectives' => ['Understand JavaScript basics', 'Manipulate the DOM', 'Handle events', 'Fetch data from APIs'],
                'prerequisites' => ['HTML & CSS basics'],
                'category' => 'Web Development',
                'instructor_index' => 0,
                'level' => 'beginner',
                'duration_hours' => 30.0,
                'price' => 79.99,
                'is_featured' => true,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'JavaScript Basics',
                        'lessons' => [
                            ['title' => 'JavaScript Introduction', 'content' => "JavaScript makes web pages interactive.\n\n## Adding JavaScript\n```html\n<script>\n  alert('Hello, World!');\n</script>\n```\n\n## Console\n```javascript\nconsole.log('Debug info');\nconsole.error('Error!');\n```", 'type' => 'video', 'duration_minutes' => 20, 'is_free' => true],
                            ['title' => 'Variables and Data Types', 'content' => "Variables store data in JavaScript.\n\n```javascript\nlet name = 'Alice';      // string\nconst age = 25;          // number\nlet isStudent = true;    // boolean\nlet scores = [90, 85];   // array\nlet person = {           // object\n  name: 'Alice',\n  age: 25\n};\n```\n\n## let vs const\n- **let**: Can be reassigned\n- **const**: Cannot be reassigned", 'type' => 'video', 'duration_minutes' => 35],
                            ['title' => 'Functions and Scope', 'content' => "Functions are reusable blocks of code.\n\n```javascript\n// Function declaration\nfunction greet(name) {\n  return `Hello, \${name}!`;\n}\n\n// Arrow function\nconst add = (a, b) => a + b;\n\n// Scope\nlet global = 'I am global';\nfunction demo() {\n  let local = 'I am local';\n}\n```", 'type' => 'video', 'duration_minutes' => 40],
                        ],
                    ],
                    [
                        'title' => 'Working with the Web',
                        'lessons' => [
                            ['title' => 'DOM Manipulation', 'content' => "The DOM is the browser's representation of your HTML.\n\n```javascript\n// Select elements\nconst title = document.getElementById('title');\nconst items = document.querySelectorAll('.item');\n\n// Modify content\ntitle.textContent = 'New Title';\ntitle.innerHTML = '<em>Styled</em>';\n\n// Styles\ntitle.style.color = 'blue';\n```\n\n## Creating Elements\n```javascript\nconst div = document.createElement('div');\ndiv.textContent = 'New content';\ndocument.body.appendChild(div);\n```", 'type' => 'video', 'duration_minutes' => 50],
                            ['title' => 'Events and Listeners', 'content' => "Events respond to user interactions.\n\n```javascript\n// Click event\nbutton.addEventListener('click', () => {\n  alert('Clicked!');\n});\n\n// Input event\ninput.addEventListener('input', (e) => {\n  console.log(e.target.value);\n});\n\n// Form submit\nform.addEventListener('submit', (e) => {\n  e.preventDefault();\n  // handle form\n});\n```", 'type' => 'video', 'duration_minutes' => 40],
                            ['title' => 'Fetch API', 'content' => "Fetch retrieves data from APIs.\n\n```javascript\n// GET request\nfetch('https://api.example.com/data')\n  .then(res => res.json())\n  .then(data => console.log(data));\n\n// Async/Await\nasync function getData() {\n  const res = await fetch('/api/data');\n  const data = await res.json();\n  return data;\n}\n```\n\n## POST Request\n```javascript\nfetch('/api/users', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ name: 'Alice' })\n});\n```", 'type' => 'video', 'duration_minutes' => 45],
                            ['title' => 'JavaScript Project', 'content' => 'Build an interactive web application using HTML, CSS, and JavaScript. Apply DOM manipulation, events, and API calls.', 'type' => 'assignment', 'duration_minutes' => 90],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Python Fundamentals',
                'description' => 'Learn Python programming from the ground up. Cover variables, control flow, functions, OOP, file handling, and basic algorithms.',
                'objectives' => ['Write Python scripts', 'Understand OOP', 'Work with files', 'Solve problems algorithmically'],
                'prerequisites' => ['Basic computer skills'],
                'category' => 'Programming',
                'instructor_index' => 2,
                'level' => 'beginner',
                'duration_hours' => 35.0,
                'price' => 89.99,
                'is_featured' => true,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'Python Basics',
                        'lessons' => [
                            ['title' => 'Introduction to Python', 'content' => "Python is a versatile, beginner-friendly programming language.\n\n## Your First Program\n```python\nprint('Hello, World!')\n```\n\n## Running Python\n```bash\npython3 script.py\n# or in interactive mode\npython3\n```", 'type' => 'video', 'duration_minutes' => 25, 'is_free' => true],
                            ['title' => 'Variables and Input', 'content' => "Variables store data. Input gets user data.\n\n```python\nname = input('What is your name? ')\nage = int(input('How old are you? '))\n\nprint(f'Hello, {name}! You are {age} years old.')\n```\n\n## Data Types\n- str: text\n- int: whole numbers\n- float: decimals\n- bool: True/False", 'type' => 'video', 'duration_minutes' => 35],
                            ['title' => 'Control Flow', 'content' => "Control flow makes decisions and repeats actions.\n\n```python\n# If/else\nif age >= 18:\n    print('Adult')\nelse:\n    print('Minor')\n\n# For loop\nfor i in range(5):\n    print(i)\n\n# While loop\nwhile count > 0:\n    count -= 1\n```", 'type' => 'video', 'duration_minutes' => 40],
                        ],
                    ],
                    [
                        'title' => 'Functions & OOP',
                        'lessons' => [
                            ['title' => 'Functions', 'content' => "Functions organize and reuse code.\n\n```python\ndef greet(name, greeting='Hello'):\n    return f'{greeting}, {name}!'\n\nresult = greet('Alice')\nresult = greet('Bob', 'Hi')\n```\n\n## Lambda Functions\n```python\nadd = lambda a, b: a + b\nnumbers = [1, 2, 3, 4]\nsquared = list(map(lambda x: x**2, numbers))\n```", 'type' => 'video', 'duration_minutes' => 35],
                            ['title' => 'Object-Oriented Programming', 'content' => "OOP organizes code into objects.\n\n```python\nclass Dog:\n    def __init__(self, name, breed):\n        self.name = name\n        self.breed = breed\n\n    def bark(self):\n        return f'{self.name} says Woof!'\n\nmy_dog = Dog('Rex', 'Labrador')\nprint(my_dog.bark())\n```\n\n## Inheritance\n```python\nclass Puppy(Dog):\n    def play(self):\n        return f'{self.name} is playing!'\n```", 'type' => 'video', 'duration_minutes' => 50],
                            ['title' => 'File Handling', 'content' => "Read and write files in Python.\n\n```python\n# Writing\nwith open('data.txt', 'w') as f:\n    f.write('Hello, World!')\n\n# Reading\nwith open('data.txt', 'r') as f:\n    content = f.read()\n\n# CSV\nimport csv\nwith open('data.csv') as f:\n    reader = csv.reader(f)\n    for row in reader:\n        print(row)\n```", 'type' => 'video', 'duration_minutes' => 30],
                            ['title' => 'Python Project', 'content' => 'Build a Python application. Choose from: calculator, to-do app, or text adventure game.', 'type' => 'assignment', 'duration_minutes' => 90],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'SQL & Database Design',
                'description' => 'Learn SQL from scratch. Cover SELECT, JOIN, subqueries, indexes, normalization, and database design principles.',
                'objectives' => ['Write SQL queries', 'Design databases', 'Understand normalization', 'Use JOINs effectively'],
                'prerequisites' => ['Basic computer skills'],
                'category' => 'Database',
                'instructor_index' => 0,
                'level' => 'beginner',
                'duration_hours' => 25.0,
                'price' => 69.99,
                'is_featured' => false,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'SQL Fundamentals',
                        'lessons' => [
                            ['title' => 'Introduction to Databases', 'content' => "Databases store and organize data.\n\n## Relational Databases\n- Data stored in tables\n- Tables have rows (records) and columns (fields)\n- Tables relate to each other via keys\n\n## SQL\nStructured Query Language for managing data.\n\n```sql\nCREATE TABLE students (\n  id INT PRIMARY KEY,\n  name VARCHAR(100),\n  email VARCHAR(100)\n);\n```", 'type' => 'video', 'duration_minutes' => 20, 'is_free' => true],
                            ['title' => 'SELECT Queries', 'content' => "SELECT retrieves data from tables.\n\n```sql\n-- Basic select\nSELECT * FROM students;\n\n-- Specific columns\nSELECT name, email FROM students;\n\n-- With conditions\nSELECT * FROM students WHERE age > 18;\n\n-- Count\nSELECT COUNT(*) FROM students;\n```", 'type' => 'video', 'duration_minutes' => 40],
                            ['title' => 'Filtering and Sorting', 'content' => "Refine your queries with filtering and sorting.\n\n```sql\n-- Sorting\nSELECT * FROM students ORDER BY name ASC;\n\n-- Limiting\nSELECT * FROM students LIMIT 10;\n\n-- Grouping\nSELECT grade, COUNT(*) as count\nFROM students\nGROUP BY grade;\n\n-- Having\nSELECT grade, COUNT(*)\nFROM students\nGROUP BY grade\nHAVING COUNT(*) > 5;\n```", 'type' => 'video', 'duration_minutes' => 35],
                            ['title' => 'JOINs', 'content' => "JOINs combine data from multiple tables.\n\n```sql\n-- Inner join\nSELECT s.name, e.course\nFROM students s\nINNER JOIN enrollments e ON s.id = e.student_id;\n\n-- Left join\nSELECT s.name, e.course\nFROM students s\nLEFT JOIN enrollments e ON s.id = e.student_id;\n```", 'type' => 'video', 'duration_minutes' => 45],
                            ['title' => 'Database Design', 'content' => "Good database design prevents redundancy.\n\n## Normalization\n- **1NF**: Each cell has one value\n- **2NF**: No partial dependencies\n- **3NF**: No transitive dependencies\n\n## Best Practices\n1. Use meaningful names\n2. Define primary keys\n3. Add foreign keys\n4. Use appropriate data types\n5. Add indexes for frequently queried columns", 'type' => 'video', 'duration_minutes' => 40],
                            ['title' => 'SQL Project', 'content' => 'Design and query a database. Create tables, insert data, and write complex queries.', 'type' => 'assignment', 'duration_minutes' => 60],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'PHP Web Development',
                'description' => 'Learn PHP for web development. Cover syntax, form handling, sessions, database integration, and security best practices.',
                'objectives' => ['Write PHP scripts', 'Handle form data', 'Work with databases', 'Implement security'],
                'prerequisites' => ['HTML & CSS basics'],
                'category' => 'Web Development',
                'instructor_index' => 1,
                'level' => 'intermediate',
                'duration_hours' => 30.0,
                'price' => 79.99,
                'is_featured' => false,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'PHP Basics',
                        'lessons' => [
                            ['title' => 'Introduction to PHP', 'content' => "PHP is a server-side language for web development.\n\n```php\n<?php\necho 'Hello, World!';\n\n// Variables\n\$name = 'Alice';\n\$age = 25;\n\n// Arrays\n\$fruits = ['apple', 'banana', 'orange'];\n?>\n```", 'type' => 'video', 'duration_minutes' => 25, 'is_free' => true],
                            ['title' => 'Variables and Control Flow', 'content' => "PHP syntax and logic.\n\n```php\n<?php\n// If/else\nif (\$age >= 18) {\n    echo 'Adult';\n} else {\n    echo 'Minor';\n}\n\n// Loops\nforeach (\$fruits as \$fruit) {\n    echo \$fruit;\n}\n?>\n```", 'type' => 'video', 'duration_minutes' => 35],
                            ['title' => 'Forms and User Input', 'content' => "Processing form data securely.\n\n```php\n<?php\n// HTML form\n<form method=\"POST\" action=\"process.php\">\n  <input name=\"email\" type=\"email\">\n  <button>Submit</button>\n</form>\n\n// Processing\n\$email = \$_POST['email'];\n\$email = filter_var(\$email, FILTER_SANITIZE_EMAIL);\n?>\n```", 'type' => 'video', 'duration_minutes' => 40],
                            ['title' => 'Database Integration', 'content' => "PHP with MySQL using PDO.\n\n```php\n<?php\n\$pdo = new PDO('mysql:host=localhost;dbname=mydb', 'user', 'pass');\n\n// Read\n\$stmt = \$pdo->query('SELECT * FROM users');\n\$users = \$stmt->fetchAll();\n\n// Write\n\$stmt = \$pdo->prepare('INSERT INTO users (name) VALUES (?)');\n\$stmt->execute([\$name]);\n?>\n```", 'type' => 'video', 'duration_minutes' => 50],
                            ['title' => 'Security Best Practices', 'content' => "Protecting your PHP application.\n\n## Key Security Practices\n1. **Sanitize inputs** - filter_var(), htmlspecialchars()\n2. **Use prepared statements** - Prevent SQL injection\n3. **Password hashing** - password_hash(), password_verify()\n4. **CSRF tokens** - Protect forms\n5. **HTTPS** - Encrypt data in transit", 'type' => 'video', 'duration_minutes' => 35],
                            ['title' => 'PHP Project', 'content' => 'Build a PHP web application with forms, database, and authentication.', 'type' => 'assignment', 'duration_minutes' => 90],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Flutter Mobile Development',
                'description' => 'Build cross-platform mobile apps with Flutter. Learn Dart, widgets, state management, navigation, and API integration.',
                'objectives' => ['Build mobile apps with Flutter', 'Master Dart language', 'Implement state management', 'Publish to app stores'],
                'prerequisites' => ['Programming basics'],
                'category' => 'Mobile Development',
                'instructor_index' => 2,
                'level' => 'intermediate',
                'duration_hours' => 40.0,
                'price' => 129.99,
                'is_featured' => false,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'Getting Started',
                        'lessons' => [
                            ['title' => 'Introduction to Flutter', 'content' => "Flutter is Google's UI toolkit for building cross-platform apps.\n\n## Why Flutter?\n- Single codebase for iOS, Android, Web\n- Fast development with Hot Reload\n- Rich widget library\n- Native performance\n\n## Setup\n```bash\nflutter create my_app\ncd my_app\nflutter run\n```", 'type' => 'video', 'duration_minutes' => 25, 'is_free' => true],
                            ['title' => 'Dart Fundamentals', 'content' => "Dart is the programming language used by Flutter.\n\n```dart\n// Variables\nString name = 'Alice';\nint age = 25;\nvar scores = [90, 85, 95];\n\n// Functions\nString greet(String name) {\n  return 'Hello, \$name!';\n}\n\n// Classes\nclass Person {\n  String name;\n  Person(this.name);\n}\n```", 'type' => 'video', 'duration_minutes' => 45],
                            ['title' => 'Widgets and Layouts', 'content' => "Everything in Flutter is a widget.\n\n```dart\nCenter(\n  child: Column(\n    mainAxisAlignment: MainAxisAlignment.center,\n    children: [\n      Text('Hello'),\n      ElevatedButton(\n        onPressed: () {},\n        child: Text('Click Me'),\n      ),\n    ],\n  ),\n)\n```", 'type' => 'video', 'duration_minutes' => 50],
                        ],
                    ],
                    [
                        'title' => 'Building Apps',
                        'lessons' => [
                            ['title' => 'State Management', 'content' => "Managing app state with setState and providers.\n\n```dart\nclass Counter extends StatefulWidget {\n  @override\n  _CounterState createState() => _CounterState();\n}\n\nclass _CounterState extends State<Counter> {\n  int count = 0;\n\n  @override\n  Widget build(BuildContext context) {\n    return Column(\n      children: [\n        Text('\$count'),\n        ElevatedButton(\n          onPressed: () => setState(() => count++),\n          child: Text('Increment'),\n        ),\n      ],\n    );\n  }\n}\n```", 'type' => 'video', 'duration_minutes' => 45],
                            ['title' => 'Navigation and Routing', 'content' => "Moving between screens in Flutter.\n\n```dart\n// Push\nNavigator.push(\n  context,\n  MaterialPageRoute(builder: (context) => DetailScreen()),\n);\n\n// Pop\nNavigator.pop(context);\n\n// Named routes\nNavigator.pushNamed(context, '/detail');\n```", 'type' => 'video', 'duration_minutes' => 35],
                            ['title' => 'API Integration', 'content' => "Connecting to backend services.\n\n```dart\nimport 'dart:convert';\nimport 'package:http/http.dart' as http;\n\nFuture<List> fetchUsers() async {\n  final response = await http.get(Uri.parse('https://api.example.com/users'));\n  return jsonDecode(response.body);\n}\n```", 'type' => 'video', 'duration_minutes' => 40],
                            ['title' => 'Flutter App Project', 'content' => 'Build a complete mobile app with multiple screens, navigation, and API integration.', 'type' => 'assignment', 'duration_minutes' => 120],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'AI & Machine Learning for Teens',
                'description' => 'Introduction to artificial intelligence and machine learning. Learn about neural networks, data processing, and build simple ML models.',
                'objectives' => ['Understand AI concepts', 'Learn ML basics', 'Build simple models', 'Use AI tools responsibly'],
                'prerequisites' => ['Python basics'],
                'category' => 'AI & Data Science',
                'instructor_index' => 0,
                'level' => 'intermediate',
                'duration_hours' => 30.0,
                'price' => 99.99,
                'is_featured' => true,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'AI Foundations',
                        'lessons' => [
                            ['title' => 'What is AI?', 'content' => "Artificial Intelligence is the simulation of human intelligence by machines.\n\n## Types of AI\n- **Narrow AI**: Specific tasks (Siri, chess)\n- **General AI**: Human-level intelligence (not yet)\n- **Machine Learning**: Learning from data\n- **Deep Learning**: Neural networks\n\n## AI Applications\n- Image recognition\n- Natural language processing\n- Self-driving cars\n- Medical diagnosis", 'type' => 'video', 'duration_minutes' => 25, 'is_free' => true],
                            ['title' => 'Machine Learning Basics', 'content' => "Machine Learning is a subset of AI.\n\n## Types of ML\n- **Supervised**: Labeled data → predictions\n- **Unsupervised**: Find patterns in data\n- **Reinforcement**: Learn through rewards\n\n## Workflow\n1. Collect data\n2. Clean data\n3. Train model\n4. Evaluate\n5. Deploy", 'type' => 'video', 'duration_minutes' => 40],
                            ['title' => 'Data Preparation', 'content' => "Good data is essential for good ML.\n\n```python\nimport pandas as pd\n\n# Load data\ndf = pd.read_csv('data.csv')\n\n# Handle missing values\ndf.fillna(0, inplace=True)\n\n# Remove duplicates\ndf.drop_duplicates(inplace=True)\n\n# Normalize\nfrom sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\ndf_scaled = scaler.fit_transform(df)\n```", 'type' => 'video', 'duration_minutes' => 35],
                            ['title' => 'Building Models', 'content' => "Create your first ML model.\n\n```python\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score\n\nX_train, X_test, y_train, y_test = train_test_split(X, y)\n\nmodel = RandomForestClassifier()\nmodel.fit(X_train, y_train)\n\npredictions = model.predict(X_test)\nprint(f'Accuracy: {accuracy_score(y_test, predictions)}')\n```", 'type' => 'video', 'duration_minutes' => 50],
                            ['title' => 'Neural Networks', 'content' => "Neural networks are inspired by the human brain.\n\n## Structure\n- **Input layer**: Receives data\n- **Hidden layers**: Process data\n- **Output layer**: Produces results\n\n## Simple Neural Network\n```python\nimport tensorflow as tf\n\nmodel = tf.keras.Sequential([\n    tf.keras.layers.Dense(64, activation='relu'),\n    tf.keras.layers.Dense(32, activation='relu'),\n    tf.keras.layers.Dense(1, activation='sigmoid')\n])\n\nmodel.compile(optimizer='adam', loss='binary_crossentropy')\nmodel.fit(X_train, y_train, epochs=10)\n```", 'type' => 'video', 'duration_minutes' => 45],
                            ['title' => 'AI Ethics', 'content' => "Responsible AI development is crucial.\n\n## Key Ethics Principles\n1. **Fairness**: Avoid bias in data and models\n2. **Transparency**: Understand how models work\n3. **Privacy**: Protect user data\n4. **Accountability**: Take responsibility for AI decisions\n5. **Safety**: Prevent harm\n\n## Bias in AI\n- Training data may reflect societal biases\n- Algorithms can amplify existing inequalities\n- Regular auditing is essential", 'type' => 'text', 'duration_minutes' => 30],
                            ['title' => 'AI Project', 'content' => 'Build an AI-powered application. Choose from: image classifier, sentiment analyzer, or recommendation system.', 'type' => 'assignment', 'duration_minutes' => 90],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Robotics & Arduino Programming',
                'description' => 'Learn robotics and Arduino programming. Build robots, understand sensors, actuators, and control systems.',
                'objectives' => ['Program Arduino', 'Work with sensors', 'Build robots', 'Understand control systems'],
                'prerequisites' => ['Basic electronics knowledge'],
                'category' => 'Robotics',
                'instructor_index' => 1,
                'level' => 'intermediate',
                'duration_hours' => 35.0,
                'price' => 109.99,
                'is_featured' => true,
                'status' => 'published',
                'modules' => [
                    [
                        'title' => 'Arduino Basics',
                        'lessons' => [
                            ['title' => 'Introduction to Arduino', 'content' => "Arduino is an open-source electronics platform.\n\n## What is Arduino?\n- Microcontroller board\n- Programmable via USB\n- Affordable and versatile\n- Huge community support\n\n## Arduino Uno Specs\n- ATmega328P processor\n- 14 digital I/O pins\n- 6 analog inputs\n- 32KB flash memory", 'type' => 'video', 'duration_minutes' => 20, 'is_free' => true],
                            ['title' => 'Arduino Programming Basics', 'content' => "Arduino programs are called sketches.\n\n```cpp\n// LED Blink\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}\n```\n\n## Key Functions\n- **setup()**: Runs once\n- **loop()**: Runs repeatedly\n- **pinMode()**: Set pin mode\n- **digitalRead/Write()**: Digital I/O", 'type' => 'video', 'duration_minutes' => 35],
                            ['title' => 'Sensors and Input', 'content' => "Sensors provide data about the environment.\n\n## Common Sensors\n- **Ultrasonic**: Distance measurement\n- **Temperature**: Temperature readings\n- **Light**: Ambient light level\n- **Motion**: PIR motion detection\n\n## Reading a Sensor\n```cpp\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int value = analogRead(A0);\n  Serial.println(value);\n  delay(1000);\n}\n```", 'type' => 'video', 'duration_minutes' => 40],
                            ['title' => 'Actuators and Output', 'content' => "Actuators produce physical action.\n\n## Common Actuators\n- **Servo Motor**: Precise angle control\n- **DC Motor**: Continuous rotation\n- **Buzzer**: Sound output\n- **LED**: Visual output\n\n## Controlling a Servo\n```cpp\n#include <Servo.h>\nServo myServo;\n\nvoid setup() {\n  myServo.attach(9);\n}\n\nvoid loop() {\n  myServo.write(90);\n  delay(1000);\n}\n```", 'type' => 'video', 'duration_minutes' => 35],
                            ['title' => 'Building a Robot', 'content' => "Assemble and program a basic robot.\n\n## Robot Components\n- Arduino Uno\n- Motor driver (L298N)\n- 2 DC motors\n- Ultrasonic sensor\n- Chassis\n\n## Basic Movement\n```cpp\n// Move forward\nvoid moveForward() {\n  digitalWrite(in1, HIGH);\n  digitalWrite(in2, LOW);\n  digitalWrite(in3, HIGH);\n  digitalWrite(in4, LOW);\n}\n```", 'type' => 'video', 'duration_minutes' => 50],
                            ['title' => 'Robotics Project', 'content' => 'Build and program your own robot. Choose from: line follower, obstacle avoider, or remote-controlled robot.', 'type' => 'assignment', 'duration_minutes' => 120],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($courses as $courseData) {
            $category = $categories->where('name', $courseData['category'])->first();
            $instructor = $instructors[$courseData['instructor_index']];

            $modulesData = $courseData['modules'] ?? [];
            unset($courseData['modules'], $courseData['category'], $courseData['instructor_index']);

            $course = Course::firstOrCreate(
                ['slug' => \Str::slug($courseData['title'])],
                array_merge($courseData, [
                    'slug' => \Str::slug($courseData['title']),
                    'category_id' => $category->id,
                    'instructor_id' => $instructor->id,
                    'published_at' => $courseData['status'] === 'published' ? now()->subDays(rand(1, 30)) : null,
                ])
            );

            $lessonSort = 1;
            foreach ($modulesData as $moduleIndex => $moduleData) {
                $module = CourseModule::updateOrCreate(
                    ['course_id' => $course->id, 'title' => $moduleData['title']],
                    [
                        'description' => $moduleData['description'] ?? null,
                        'sort_order' => $moduleIndex + 1,
                    ]
                );

                foreach ($moduleData['lessons'] as $lessonData) {
                    $lesson = $course->lessons()->firstOrCreate(
                        ['slug' => \Str::slug($lessonData['title'])],
                        [
                            'module_id' => $module->id,
                            'module_name' => $moduleData['title'],
                            'title' => $lessonData['title'],
                            'slug' => \Str::slug($lessonData['title']),
                            'content' => $lessonData['content'],
                            'type' => $lessonData['type'],
                            'duration_minutes' => $lessonData['duration_minutes'],
                            'sort_order' => $lessonSort++,
                            'is_free' => $lessonData['is_free'] ?? false,
                        ]
                    );

                    if ($lessonData['type'] === 'quiz' && !$lesson->quiz) {
                        $quiz = Quiz::create([
                            'lesson_id' => $lesson->id,
                            'title' => $lessonData['title'],
                            'description' => 'Test your knowledge on this topic.',
                            'passing_score' => 70,
                            'time_limit_minutes' => 30,
                            'max_attempts' => 3,
                            'is_randomized' => false,
                        ]);

                        $quiz->questions()->createMany([
                            [
                                'question' => 'What is the main topic covered in this course?',
                                'type' => 'multiple_choice',
                                'options' => ['Programming', 'Design', 'Hardware', 'None of the above'],
                                'correct_answer' => 'Programming',
                                'explanation' => 'This course focuses on the topics covered throughout all lessons.',
                                'points' => 1,
                                'sort_order' => 1,
                            ],
                            [
                                'question' => 'Practice is essential for mastering any skill.',
                                'type' => 'true_false',
                                'options' => ['True', 'False'],
                                'correct_answer' => 'True',
                                'explanation' => 'Consistent practice is key to learning.',
                                'points' => 1,
                                'sort_order' => 2,
                            ],
                            [
                                'question' => 'Which of the following is a best practice for writing code?',
                                'type' => 'multiple_choice',
                                'options' => ['Write comments', 'Use meaningful names', 'Keep functions short', 'All of the above'],
                                'correct_answer' => 'All of the above',
                                'explanation' => 'All of these are coding best practices.',
                                'points' => 1,
                                'sort_order' => 3,
                            ],
                            [
                                'question' => 'What should you do before starting a project?',
                                'type' => 'multiple_choice',
                                'options' => ['Plan the approach', 'Start coding immediately', 'Skip documentation', 'None of these'],
                                'correct_answer' => 'Plan the approach',
                                'explanation' => 'Planning helps you understand requirements and design a solution.',
                                'points' => 1,
                                'sort_order' => 4,
                            ],
                            [
                                'question' => 'Breaking complex problems into smaller parts is called:',
                                'type' => 'multiple_choice',
                                'options' => ['Abstraction', 'Decomposition', 'Encapsulation', 'Polymorphism'],
                                'correct_answer' => 'Decomposition',
                                'explanation' => 'Decomposition is breaking down complex problems into manageable parts.',
                                'points' => 1,
                                'sort_order' => 5,
                            ],
                        ]);
                    }
                }
            }
        }
    }
}
