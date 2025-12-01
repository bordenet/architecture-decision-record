#!/usr/bin/env bash
set -euo pipefail

# Architecture Decision Record Assistant - Web Deployment
# Deploys to GitHub Pages with quality gates

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Flags
SKIP_TESTS=0
VERBOSE=0

print_header() {
  echo -e "${BLUE}==>${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-tests)
      SKIP_TESTS=1
      shift
      ;;
    -v|--verbose)
      VERBOSE=1
      shift
      ;;
    -h|--help)
      echo "Usage: ./scripts/deploy-web.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --skip-tests    Skip running tests (not recommended)"
      echo "  -v, --verbose   Verbose output"
      echo "  -h, --help      Show this help message"
      exit 0
      ;;
    *)
      print_error "Unknown option: $1"
      exit 1
      ;;
  esac
done

cd "$PROJECT_DIR"

# Header
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Architecture Decision Record - Web Deployment          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check git status
print_header "Checking git status"
if ! git diff-index --quiet HEAD --; then
  print_error "Working directory has uncommitted changes"
  echo "Commit or stash changes before deploying"
  exit 1
fi
print_success "Working directory clean"

# Linting
print_header "Running linting"
if ! npm run lint; then
  print_error "Linting failed"
  exit 1
fi
print_success "Linting passed"

# Tests (unless skipped)
if [ $SKIP_TESTS -eq 0 ]; then
  print_header "Running unit tests"
  if ! npm run test:unit; then
    print_error "Unit tests failed"
    exit 1
  fi
  print_success "Unit tests passed"

  print_header "Checking coverage"
  if ! npm run test:coverage > /dev/null 2>&1; then
    print_warning "Coverage threshold not met"
  fi
else
  print_header "Tests skipped (--skip-tests flag)"
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo ""
echo "Deployment info:"
echo "  Branch: $CURRENT_BRANCH"
echo "  Commit: $(git rev-parse --short HEAD)"
echo "  Date: $(date)"
echo ""

# Confirmation
read -p "Ready to deploy to GitHub Pages? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  print_error "Deployment cancelled"
  exit 1
fi

# Create deployment commit
print_header "Creating deployment commit"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git add -A
git commit -m "Deploy: $TIMESTAMP" || print_success "No changes to commit"

# Push to origin
print_header "Pushing to GitHub"
git push origin "$CURRENT_BRANCH"
print_success "Push successful"

# Summary
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Your site will be live at:"
echo "  https://bordenet.github.io/architecture-decision-record/"
echo ""
echo "It may take a few minutes to update."
echo ""
