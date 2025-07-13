# Deployment Guide for Render

## Environment Variables Required

Make sure to set these environment variables in your Render dashboard:

1. **MONGO_URL** - Your MongoDB connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database_name`
   - Make sure your MongoDB Atlas cluster allows connections from all IPs (0.0.0.0/0)

2. **PORT** - Render will set this automatically, but you can override it
3. **NODE_ENV** - Set to `production`
4. **JWT_SECRET** - If you're using JWT authentication

## Render Configuration

1. **Build Command**: Leave empty (not needed for Node.js)
2. **Start Command**: `npm start`
3. **Health Check Path**: `/health`

## Common Issues and Solutions

### Bad Gateway Error
- Check if your MongoDB connection string is correct
- Ensure your MongoDB Atlas cluster allows connections from Render's IPs
- Verify all environment variables are set correctly
- Check the logs in Render dashboard for specific error messages

### Database Connection Issues
- Make sure your MongoDB Atlas cluster is running
- Check if your database user has the correct permissions
- Verify the connection string format

### Port Issues
- Render automatically sets the PORT environment variable
- Your app should use `process.env.PORT || 4000`

## Testing Your Deployment

1. Visit your Render URL + `/health` to check if the server is running
2. Visit your Render URL + `/` to see the "API Working" message
3. Test your API endpoints with the full Render URL

## Logs and Debugging

- Check Render logs in the dashboard for error messages
- The server now has better error handling and logging
- Unhandled promise rejections will be logged and the process will exit gracefully 