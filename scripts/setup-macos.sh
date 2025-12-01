#!/usr/bin/env bash
set -euo pipefail

# Architecture Decision Record Assistant - macOS Setup
# Installs all dependencies and configures the project

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
  echo -e "${BLUE}==>${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

check_command() {
  if ! command -v "$1" &> /dev/null; then
    return 1
  fi
  return 0
}

# Header
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Architecture Decision Record Assistant - macOS Setup    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check Node.js
print_header "Checking Node.js installation"
if check_command "node"; then
  NODE_VERSION=$(node -v)
  print_success "Node.js $NODE_VERSION found"
else
  print_error "Node.js not found"
  echo "Install Node.js from: https://nodejs.org/"
  exit 1
fi

# Check npm
print_header "Checking npm installation"
if check_command "npm"; then
  NPM_VERSION=$(npm -v)
  print_success "npm $NPM_VERSION found"
else
  print_error "npm not found"
  exit 1
fi

# Check Homebrew (optional but recommended)
print_header "Checking Homebrew"
if check_command "brew"; then
  print_success "Homebrew found"
  
  # Optional: Install shellcheck for script validation
  if ! check_command "shellcheck"; then
    print_warning "shellcheck not found, installing..."
    brew install shellcheck
  fi
else
  print_warning "Homebrew not found (optional)"
fi

# Install project dependencies
print_header "Installing project dependencies"
cd "$PROJECT_DIR"
npm install
print_success "Dependencies installed"

# Create .env file if it doesn't exist
print_header "Configuring environment"
if [ ! -f "$PROJECT_DIR/.env" ]; then
  cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
  print_success ".env file created"
else
  print_success ".env file already exists"
fi

# Run linting
print_header "Running linting checks"
npm run lint:fix
print_success "Linting complete"

# Run tests
print_header "Running unit tests"
npm run test:unit
print_success "Unit tests passed"

# Run coverage check
print_header "Checking test coverage"
npm run test:coverage 2>&1 | tail -1
print_success "Coverage check complete"

# Summary
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup completed successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Start development server: npm run serve"
echo "2. Open in browser: http://localhost:8000"
echo "3. Run tests: npm run test:unit"
echo "4. Deploy: ./scripts/deploy-web.sh"
echo ""
