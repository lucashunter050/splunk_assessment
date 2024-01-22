This repo contains an electron application that an access your Splunk enterprise deployment and process search queries.
Functionality is limited and unlikely to improve.

To build an executable for your system:
```cd splunk_assessment```

Enter
```npm run make``` to build an executable for your operating system.

If this command fails, you may need to run ```npm intall``` first.

```cd out/make/zip/darwin/arm64```

This command assumes you are running MacOS on arm64 architecture. Commands for windows should be similar. From here, you can unzip the .zip file and a desktop executable should be created.
