IMAGE_NAME := vca/dialer-server
OCI_FNAME := Dockerfile
SELINUX := :z

help:
		@echo "make build - Build and locally tag a new image."
		@echo "make build-force - Use a no-cache build"
		@echo "make run-int - Run the new image interactively"

build:
		@podman build --file=$(OCI_FNAME) . -t $(IMAGE_NAME)

build-force:
		@podman build --file=$(OCI_FNAME) --no-cache . -t $(IMAGE_NAME)

run-int:
		@podman run -it --env-file secrets.env -p 8080:8080 -v $(PWD)/src:/opt/dialer-server:z --entrypoint /bin/bash $(IMAGE_NAME)

run:
		@podman run -d --env-file secrets.env -p 8080:8080 -v $(PWD)/src:/opt/dialer-server:z $(IMAGE_NAME)
