FROM fedora
RUN dnf install -y node npm && \
    dnf clean all
RUN npm install --save twilio ws express @google-cloud/speech
RUN npm install nodemon -g
WORKDIR /opt/dialer-server
VOLUME /opt/dialer-server
EXPOSE 8080
ENTRYPOINT [ "nodemon", "server.js" ]
