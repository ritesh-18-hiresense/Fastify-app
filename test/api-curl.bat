@echo off
set BASE=http://localhost:3000

echo.
echo ============ API Curl Tests ============
echo.
echo Make sure the server is running at %BASE%
echo Press Ctrl+C to cancel
echo.

echo --- 1. CREATE user ---
curl.exe -s -X POST "%BASE%/users" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Alice\",\"email\":\"alice@test.com\"}"
echo.
echo.

echo --- 2. GET user by ID (1) ---
curl.exe -s "%BASE%/users/1"
echo.
echo.

echo --- 3. GET user by email ---
curl.exe -s "%BASE%/users/email?email=alice@test.com"
echo.
echo.

echo --- 4. LIST all users ---
curl.exe -s "%BASE%/users"
echo.
echo.

echo --- 5. UPDATE user (id=2) ---
curl.exe -s -X PUT "%BASE%/users/1" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Alice Updated\"}"
echo.
echo.

echo --- 6. BATCH create users ---
curl.exe -s -X POST "%BASE%/users/batch" ^
  -H "Content-Type: application/json" ^
  -d "{\"users\":[{\"name\":\"Bob1\",\"email\":\"bob1@test.com\"},{\"name\":\"Carol1\",\"email\":\"carol1@test.com\"}]}"
echo.
echo.

echo --- 7. DELETE user (id=1) ---
curl.exe -s -o nul -w "HTTP Status: %%{http_code}" -X DELETE "%BASE%/users/1"
echo.
echo.

echo --- 8. DUPLICATE email (should return 409) ---
curl.exe -s -w "\nHTTP Status: %%{http_code}" -X POST "%BASE%/users" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Alice\",\"email\":\"alice@test.com\"}"
echo.
echo.

echo --- 9. GET non-existent user (should return 404) ---
curl.exe -s -w "\nHTTP Status: %%{http_code}" "%BASE%/users/99999"
echo.
echo.

echo --- 10. DELETE non-existent user (should return 404) ---
curl.exe -s -w "\nHTTP Status: %%{http_code}" -X DELETE "%BASE%/users/99999"
echo.
echo.

echo ============ Tests Complete ============
echo.
pause
