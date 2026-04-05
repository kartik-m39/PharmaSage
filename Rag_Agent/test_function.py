#!/usr/bin/env python3
"""
Test script for PharmaSage RAG Agent Azure Function
Tests all three query modes: llm, retriever, and clean
"""

import requests
import json
import sys
import time
from typing import Dict, Any

# ANSI color codes for pretty output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

# Test configuration
TEST_QUERIES = [
    {
        "query": "What is aspirin used for?",
        "mode": "llm",
        "description": "LLM-powered RAG response"
    },
    {
        "query": "What are the side effects of ibuprofen?",
        "mode": "retriever",
        "description": "Raw retriever results"
    },
    {
        "query": "Tell me about paracetamol dosage",
        "mode": "clean",
        "description": "Clean sentence extraction"
    }
]


def print_header(text: str):
    """Print formatted header"""
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}{text.center(70)}{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")


def print_success(text: str):
    """Print success message"""
    print(f"{GREEN}✓ {text}{RESET}")


def print_error(text: str):
    """Print error message"""
    print(f"{RED}✗ {text}{RESET}")


def print_info(text: str):
    """Print info message"""
    print(f"{YELLOW}ℹ {text}{RESET}")


def test_endpoint(base_url: str, test_case: Dict[str, Any]) -> bool:
    """
    Test a single endpoint with given query and mode
    
    Args:
        base_url: Base URL of the function (with /api/query)
        test_case: Dict with 'query', 'mode', and 'description'
    
    Returns:
        bool: True if test passed, False otherwise
    """
    print(f"\n{YELLOW}Testing: {test_case['description']}{RESET}")
    print(f"Query: '{test_case['query']}'")
    print(f"Mode: {test_case['mode']}")
    
    payload = {
        "query": test_case["query"],
        "mode": test_case["mode"]
    }
    
    try:
        start_time = time.time()
        response = requests.post(
            base_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        duration = time.time() - start_time
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Time: {duration:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            if "query" in data and "mode" in data and "response" in data:
                print_success("Response structure valid")
                
                # Print response (truncated)
                response_text = data["response"]
                if len(response_text) > 200:
                    response_text = response_text[:200] + "..."
                
                print(f"\n{BLUE}Response:{RESET}")
                print(f"{response_text}")
                
                return True
            else:
                print_error("Invalid response structure")
                print(f"Response: {json.dumps(data, indent=2)}")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print_error("Request timed out after 60 seconds")
        return False
    except requests.exceptions.ConnectionError:
        print_error("Connection error - check if the function is running")
        return False
    except Exception as e:
        print_error(f"Unexpected error: {str(e)}")
        return False


def run_tests(base_url: str):
    """
    Run all tests against the Azure Function
    
    Args:
        base_url: Base URL of the function (with /api/query)
    """
    print_header("PharmaSage RAG Agent - Azure Function Tests")
    
    print_info(f"Testing endpoint: {base_url}")
    
    # Test endpoint availability
    print("\n" + "─" * 70)
    print(f"{YELLOW}Testing endpoint availability...{RESET}")
    try:
        response = requests.get(base_url.replace("/query", ""), timeout=10)
        print_success("Endpoint is reachable")
    except:
        print_error("Cannot reach endpoint - it may not be deployed yet")
        print_info("If testing locally, make sure to run: func start")
        return
    
    # Run test cases
    results = []
    for i, test_case in enumerate(TEST_QUERIES, 1):
        print("\n" + "─" * 70)
        print(f"{BLUE}Test {i}/{len(TEST_QUERIES)}{RESET}")
        result = test_endpoint(base_url, test_case)
        results.append(result)
        time.sleep(1)  # Brief pause between tests
    
    # Print summary
    print_header("Test Summary")
    
    passed = sum(results)
    total = len(results)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {GREEN}{passed}{RESET}")
    print(f"Failed: {RED}{total - passed}{RESET}")
    
    if passed == total:
        print_success("\nAll tests passed! 🎉")
        sys.exit(0)
    else:
        print_error(f"\n{total - passed} test(s) failed")
        sys.exit(1)


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print_error("Usage: python test_function.py <FUNCTION_URL>")
        print_info("\nExamples:")
        print("  Local testing:")
        print("    python test_function.py http://localhost:7071/api/query")
        print("\n  Azure testing:")
        print("    python test_function.py https://pharmasage-rag-prod.azurewebsites.net/api/query")
        sys.exit(1)
    
    base_url = sys.argv[1]
    
    # Ensure URL ends correctly
    if not base_url.endswith("/query") and not base_url.endswith("/api/query"):
        if base_url.endswith("/"):
            base_url += "api/query"
        else:
            base_url += "/api/query"
    
    run_tests(base_url)


if __name__ == "__main__":
    main()
