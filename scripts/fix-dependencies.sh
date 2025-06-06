#!/bin/bash

echo "🔧 Fixing dependency conflicts..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Cleaning up existing installation...${NC}"
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

echo -e "${YELLOW}Step 2: Clearing npm cache...${NC}"
npm cache clean --force

echo -e "${YELLOW}Step 3: Installing dependencies with legacy peer deps...${NC}"
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
    echo -e "${YELLOW}Starting development server...${NC}"
    npm run dev
else
    echo -e "${RED}❌ Installation failed. Trying alternative method...${NC}"
    
    echo -e "${YELLOW}Trying with --force flag...${NC}"
    npm install --force
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed with --force!${NC}"
        npm run dev
    else
        echo -e "${RED}❌ NPM installation failed. Trying with Yarn...${NC}"
        
        # Check if yarn is installed
        if command -v yarn &> /dev/null; then
            yarn install
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Dependencies installed with Yarn!${NC}"
                yarn dev
            else
                echo -e "${RED}❌ All installation methods failed.${NC}"
                echo -e "${YELLOW}Please check the TROUBLESHOOTING.md file for manual solutions.${NC}"
            fi
        else
            echo -e "${YELLOW}Yarn not found. Installing Yarn...${NC}"
            npm install -g yarn
            yarn install
            yarn dev
        fi
    fi
fi
