import { Skill } from '../types';

export const PRESET_SKILLS: Skill[] = [
  {
    id: 'skill-1',
    title: 'Compose State Hoisting',
    description: 'Enforces clean UI state hoisting using (value, onValueChange) pattern',
    category: 'UI',
    isActive: true,
    promptSnippet: `When writing Jetpack Compose / React UI:
1. Always hoist mutable state to the caller or ViewModel.
2. Use (value, onValueChange) pattern for controls.
3. Never store mutable business state inside leaf composables.
4. Ensure components are stateless where possible for reusability and testability.`
  },
  {
    id: 'skill-2',
    title: 'Room Entity & DAO Checklist',
    description: 'Strict 4-step sequence for local Room database implementation',
    category: 'Database',
    isActive: true,
    promptSnippet: `For Room implementation in Android:
1. Define @Entity data class with @PrimaryKey(autoGenerate = true).
2. Create @Dao interface with query, insert, and delete suspending functions / Flows.
3. Build @Database abstract class inheriting RoomDatabase().
4. Write repository and ViewModel integration using Flow and StateFlow.`
  },
  {
    id: 'skill-3',
    title: 'Scaffold & Padding Pattern',
    description: 'Standard Material 3 Screen layout structure with proper padding',
    category: 'UI',
    isActive: true,
    promptSnippet: `Always structure screens with Scaffold:
1. Scaffold(topBar = { TopAppBar(...) }, floatingActionButton = { ... }) { paddingValues -> ... }
2. Always apply paddingValues to the root content container (e.g. Modifier.padding(paddingValues)).
3. Use MaterialTheme.colorScheme for colors and MaterialTheme.typography for text.`
  },
  {
    id: 'skill-4',
    title: 'Clean Architecture & Coroutines',
    description: 'Unidirectional data flow with ViewModel, StateFlow, and Coroutines',
    category: 'Architecture',
    isActive: true,
    promptSnippet: `Architecture Rules:
1. Separate UI (Compose/React), Domain (UseCases/Orchestrator), and Data (Repository/API/DB) layers.
2. Expose immutable UI state via StateFlow / reactive state hooks.
3. Perform background operations on Dispatchers.IO and keep UI rendering non-blocking.`
  },
  {
    id: 'skill-5',
    title: 'Security & Secret Management',
    description: 'Prevent hardcoded API keys and validate network inputs',
    category: 'Security',
    isActive: true,
    promptSnippet: `Security Directives:
1. Never hardcode API keys, tokens, or credentials in client files or committed code.
2. Load secrets dynamically from environment variables or BuildConfig / EncryptedSharedPreferences.
3. Sanitize user inputs and handle network exceptions gracefully.`
  }
];
