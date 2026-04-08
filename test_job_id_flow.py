#!/usr/bin/env python3
"""
Test script to verify how job IDs are handled between backend and frontend
"""

import requests
import json
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000/api/v1"  # Adjust if your backend runs on a different port
HEADERS = {
    "Content-Type": "application/json",
}

def print_section(title: str):
    print(f"\n{'='*60}")
    print(f"{title}")
    print('='*60)

def pretty_print_json(data: Any, title: str = ""):
    if title:
        print(f"\n{title}:")
    print(json.dumps(data, indent=2))

def test_job_structure():
    """Test 1: Get a job and examine its structure"""
    print_section("Test 1: Examining Job Structure from API")
    
    try:
        # First, let's get the list of jobs
        response = requests.get(f"{BASE_URL}/jobs/", params={"limit": 1})
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("jobs") and len(data["jobs"]) > 0:
                job = data["jobs"][0]
                pretty_print_json(job, "Sample Job from API")
                
                # Check which ID field exists
                print("\nID Field Analysis:")
                if "job_id" in job:
                    print(f"✓ job_id exists: {job['job_id']}")
                else:
                    print("✗ job_id does NOT exist")
                    
                if "id" in job:
                    print(f"✓ id exists: {job['id']}")
                else:
                    print("✗ id does NOT exist")
                    
                return job.get("job_id") or job.get("id")
            else:
                print("No jobs found in the system")
        else:
            print(f"Failed to fetch jobs: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to backend. Make sure the backend is running on", BASE_URL)
    except Exception as e:
        print(f"ERROR: {str(e)}")
    
    return None

def test_update_job_endpoint(job_id: str):
    """Test 2: Test how the update endpoint expects the job ID"""
    print_section("Test 2: Testing Update Job Endpoint")
    
    if not job_id:
        print("Skipping test - no job ID available")
        return
    
    print(f"Testing with job ID: {job_id}")
    
    # Try to get the specific job first
    try:
        # Test GET endpoint with job_id
        get_response = requests.get(f"{BASE_URL}/jobs/{job_id}")
        
        if get_response.status_code == 200:
            print(f"✓ GET /jobs/{job_id} successful")
            job_data = get_response.json()
            pretty_print_json(job_data, "Job retrieved by ID")
        else:
            print(f"✗ GET /jobs/{job_id} failed with status {get_response.status_code}")
            print(get_response.text)
            
    except Exception as e:
        print(f"ERROR in GET request: {str(e)}")

def simulate_frontend_mapping():
    """Test 3: Simulate how frontend maps the data"""
    print_section("Test 3: Simulating Frontend Data Mapping")
    
    try:
        response = requests.get(f"{BASE_URL}/jobs/", params={"limit": 1})
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("jobs") and len(data["jobs"]) > 0:
                api_job = data["jobs"][0]
                
                # Simulate the frontend mapping (from use-job-posts.tsx)
                frontend_job = {
                    "id": api_job.get("job_id"),  # This is the mapping!
                    "title": api_job.get("title"),
                    "description": api_job.get("description", ""),
                    "location": api_job.get("location"),
                    "type": api_job.get("job_type", "Full-time"),
                    "salary": api_job.get("salary_range", ""),
                    "isBoosted": False,
                    "datePosted": api_job.get("created_at"),
                    "applicants": api_job.get("application_count", 0),
                    "views": 0
                }
                
                print("API Job Structure:")
                print(f"  - job_id: {api_job.get('job_id')}")
                print(f"  - id: {api_job.get('id')}")
                
                print("\nFrontend JobPost Structure (after mapping):")
                print(f"  - id: {frontend_job['id']}")
                print(f"  - job_id: {frontend_job.get('job_id', 'NOT PRESENT')}")
                
                pretty_print_json(frontend_job, "\nComplete Frontend Job Object")
                
    except Exception as e:
        print(f"ERROR: {str(e)}")

def test_actual_update_flow():
    """Test 4: Test the actual update flow"""
    print_section("Test 4: Testing Actual Update Flow")
    
    print("This test would require authentication. Here's what happens:")
    print("1. Frontend has JobPost with 'id' field (mapped from API's 'job_id')")
    print("2. EditJobDialog receives job: JobPost")
    print("3. On submit, it should call updateJob(job.id, values)")
    print("4. updateJob function sends PUT request to /jobs/{id}")
    print("5. Backend expects the job_id in the URL path")

def main():
    print("Job ID Flow Test Script")
    print("======================")
    print(f"Testing against: {BASE_URL}")
    
    # Run tests
    job_id = test_job_structure()
    test_update_job_endpoint(job_id)
    simulate_frontend_mapping()
    test_actual_update_flow()
    
    print_section("CONCLUSION")
    print("Based on the code analysis:")
    print("1. Backend API uses 'job_id' field")
    print("2. Frontend JobPost interface uses 'id' field")
    print("3. When fetching, frontend maps API's job_id → JobPost.id")
    print("4. Therefore, EditJobDialog should use 'job.id' NOT 'job.job_id'")
    print("\nThe correct line 64 in EditJobDialog.tsx should be:")
    print("    updateJob(job.id, values);")

if __name__ == "__main__":
    main()
