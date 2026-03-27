## Packages
lucide-react | Icons for UI
clsx | Utility for conditional classes
tailwind-merge | Utility for merging tailwind classes safely
framer-motion | Smooth animations and page transitions
date-fns | Date formatting
sonner | Beautiful toast notifications
jwt-decode | Decoding JWT tokens for auth state
@tanstack/react-query | Async state management and data fetching
wouter | Lightweight routing

## Notes
The backend is proxying `/api` locally via Vite.
All API requests use `fetch` with the `Authorization: Bearer <token>` header pointing to localStorage.
Assuming standard wrapper responses from the backend like `{ success: true, data: ... }` or directly returning the entity.
