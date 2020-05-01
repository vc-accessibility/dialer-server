# dialer-server

## Origin
I was catching up with a friend, who is also a colleague, for the
first time in quite awhile in early March.
We were texting over whatsapp and we were discussing the difficulties
that she has using our video conferencing service now that all her
meetings are remote as she is getting increasingly hard of hearing.

We went on to discuss how some of the apps do real-time
transcription/close-captioning. However, the one the company uses,
primarily, doesn't. I then had the thought how easy it should be too:

* create a web page where the user could enter the audio dial in for their call
* have Twilio dial that number
* pass the audio stream to Google Speech to Text
* feed closed captions back to the user

## Try it out

You need to install [`podman`](https://podman.io/) and `make` and
then git clone this repo.
All of this is based on Fedora, but you should able to use this on
any platform that you can get `podman` and `make` on. If you can't
get `podman` you can also use `docker`.
However, you will have to modify the `Makefile` to swap `podman` for `docker`.

```bash
$ dnf install podman make
$ git clone git@github.com:vc-accessibility/dialer-server.git
$ cd dialer-server
```
Now, you need to configure your environment. First, setup the secrets file.
You will need your Twilio Account SID, AuthToken, phone number and at least
one validated number.

You also need to configure a Google CP project and create a service account
and get the authentication json file. When it asks you about "roles" skip it.
Name the file gaccount.json and put it in the `src` directory under dialer-server.

```bash
$ cp secrets.env.sample secrets.env
$ vi secrets.env #the fake values should help
```

You also need to create a self-signed certificate, unless you have real ones.
If you are using self-signed certs you need to tell Twilio about it in the console
under Home | Settings | General (it is towards the bottom of the page).

```bash
$ openssl genrsa -out key.pem
$ openssl req -new -key key.pem -out csr.pem
$ openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
$ cp cert.pem key.pem src/
```

Now, you should be able to finally run the application

```bash
$ make build
$ make run
```

## Future Work

I would like to get this deployed as [knative](http://knative.dev) serverless
containers on [OpenShift](https://www.openshift.com/) and offer it as a real service.

I also would like to add:
* post call transcriptions
* translations to other languages
* investigate the feasibility of "translating" to Sign Language (ASL to start)

## Handy Helper

If you need the Twilio CLI but don't want to actually install it, I also wrote
a "[twilio-helper](https://github.com/vc-accessibility/twilio-helper)" container
that should be handy.

## Acknowledgements

The application is largely based on work from [nokenwa's demo](https://github.com/nokenwa/twilio-media-stream-live-transcription-node).

As always, many, many references on the internet.
I think I have about 70 odd tabs open.
