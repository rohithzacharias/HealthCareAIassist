#!/usr/bin/env python3
"""
MedAide AI - Healthcare Student Assistant
Startup script to run the Flask backend server
"""

import os
import sys
import webbrowser
import time
import threading
from app import app

def open_browser():
    """Open browser after a short delay"""
    time.sleep(1.5)
    webbrowser.open('http://localhost:5000')

def main():
    """Main function to start the application"""
    print("🏥 MedAide AI - Healthcare Student Assistant")
    print("=" * 50)
    print("Starting Flask backend server...")
    print("Backend will be available at: http://localhost:5000")
    print("Frontend will be available at: http://localhost:5000")
    print("=" * 50)
    print("Press Ctrl+C to stop the server")
    print()
    
    # Start browser in a separate thread
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    try:
        # Run the Flask app
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=False  # Disable reloader to prevent double startup
        )
    except KeyboardInterrupt:
        print("\n\n👋 MedAide AI server stopped. Thank you for using our healthcare assistant!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
