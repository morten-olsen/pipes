docker build -t pipes .
docker run -it --rm -v /var/run/docker.sock:/var/run/docker.sock -p 4000:3005 pipes