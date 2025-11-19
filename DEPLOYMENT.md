# Deployment Configuration

This project is configured to deploy the frontend on Netlify and the backend on Vercel.

## Environment Variables

### Backend (Vercel)
Create a `.env` file in the `server` directory or set these in Vercel dashboard:

```env
# Required: Your frontend URL for CORS
FRONTEND_URL=https://your-frontend.netlify.app

# Optional: Node environment
NODE_ENV=production
```

### Frontend (Netlify)
Set these in your Netlify dashboard under Site settings > Environment variables:

```env
# Required: Your backend API URL
VITE_API_URL=https://your-backend.vercel.app
```

## Deployment Steps

### Backend (Vercel)
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set the Root Directory to `server`
4. Add the environment variables above
5. Deploy

### Frontend (Netlify)
1. Go to [Netlify](https://netlify.com)
2. Import your GitHub repository
3. Set the Build command to `npm run build`
4. Set the Publish directory to `client/dist`
5. Add the environment variables above
6. Deploy

## Local Development

For local development, the project will continue to work as before:
- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:3000`
- API calls are proxied through Vite dev server

## Important Notes

1. **CORS Configuration**: Make sure to update the `FRONTEND_URL` in your backend environment variables to match your actual Netlify URL.

2. **API URL**: Update the `VITE_API_URL` in your frontend environment variables to match your actual Vercel URL.

3. **Build Commands**:
   - Frontend: `npm run build` (in client directory)
   - Backend: `npm run build` (in server directory)

4. **Development vs Production**:
   - In development, the frontend uses Vite's proxy to connect to the backend
   - In production, the frontend directly calls the Vercel backend URL

## Troubleshooting

If you encounter CORS issues:
1. Check that `FRONTEND_URL` in your backend matches your Netlify URL exactly
2. Make sure there are no trailing slashes in the URL
3. Verify that the environment variables are properly set in both platforms

If API calls fail:
1. Check the browser's network tab to see the actual API URL being called
2. Verify that `VITE_API_URL` is set correctly in Netlify
3. Check Vercel function logs for any backend errors
