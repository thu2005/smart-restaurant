# Render build script
echo "Starting Render build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

echo "Build completed successfully!"
