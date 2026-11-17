# AskOxy Admin

A responsive React administration app built with Vite, JavaScript, React Router DOM, and Tailwind CSS. The Users and Posts pages load data from JSONPlaceholder through shared Axios services, and the Products pages use DummyJSON. Post create, edit, and delete operations update the current page state; JSONPlaceholder does not persist these writes across a reload.

## Getting started

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Validate the production bundle with `npm run build`, and check code style with `npm run lint`.

## Routes

- `/users` — searchable user directory; `/users/:userId` — user details
- `/posts` — create, list, edit, and delete posts; `/posts/:postId` — post details
- `/products` — searchable, paginated product catalog
- `/products/:productId` — product details and images

The root path redirects to `/users`.

## Source structure

```text
src/
  components/  Shared UI: buttons, loading/error states, and navigation
  layouts/     Shared admin shell around route content
  pages/       Feature route pages
  services/    Shared Axios client and Users/Posts/Products API request functions
  App.jsx      Router and route definitions
  index.css    Tailwind import and global base styles
  main.jsx     React application entry point
```

Page-specific headings, forms, and content stay in their page files.
The responsive sidebar state stays in the admin layout because it is only used there.
