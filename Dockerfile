FROM fedora
RUN dnf install -y node npm && \
    dnf clean all
RUN npm install twilio
#ADD src /opt/dialer-server
VOLUME /opt/dialer-server
CMD [ "/bin/bash" ]