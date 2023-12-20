correct way to store password
    OWASP => open web application security project
    hash password with salt using express

Generate pem
    1- Install OpenSSL for Windows:
        https://slproweb.com/products/Win32OpenSSL.html

    2- openssl genpkey -algorithm RSA -out private_key.pem

    3- openssl rsa -pubout -in private_key.pem -out public.pem

