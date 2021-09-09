const { exec } = require("child_process");
var express = require('express');
var router = express.Router();
var User = require('../Models/User');
const fs = require('fs');
const Mail = require('../Utils/Mailer');
var cloudinary = require('cloudinary');
var CommandQueue = [];
var available = true;

var ExecuteCommand = async(email, name, symbol, accAddress, url) => {
    available = false;
    console.log("Creating NFT " + email + " " + name + ' ' + symbol + ' ' + url);
    exec("npx truffle migrate --reset --network rinkeby " + name + " " + symbol + " " + url.substr(0, url.length - 1) + " " + accAddress, async(error, stdout, stderr) => {
        if (error) {
            const user = await User.findOneAndUpdate({ email: email }, { isNFTInProgress: false });
            Mail.SendEmail(email, "NFT Creation Request Update", 'Hello User,\n\nGreetings!\n\nWe regret to convey that unfortunately, the request for creating the NFT - ' + name + ' could not be completed successfully.\n\nWe are currentlyworking with limited resources and though rare, such failures can occur due any of the following reasons:\n\nWe are striving hard to make continuous enhancements in our services and resources. You can choose to retry creating the NFT once as per time of your convenience and it should get completed.\n\nThank you for your understanding and cooperation. \n\nHave an awesome day ahead!');
            console.log(`error: ${error.message}`);
            console.log(email + ' ' + name + "**************************************************************");
            console.log(`error: ${stdout}`);
            console.log("**************************************************************");
            if (CommandQueue.length == 0) {
                available = true;
            } else {
                var data = CommandQueue.shift();
                ExecuteCommand(data.email, data.name, data.symbol, data.address, data.url);
            }

            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            //return;
        }
        canCreateToken = true;
        let index = stdout.indexOf("@#$%");
        let address = stdout.substr(index + 4, 42);
        console.log(`stdout: ${address}`);
        var user = await User.findOne({ email: email });
        if (!user.NFT) {
            user.NFT = [];
        }
        user.isNFTInProgress = false;
        user.NFT.push(address);
        await user.save();
        console.log("Created NFT");
        setTimeout(() => {
            Mail.SendEmail(email, "NFT Creation Request Update",
                'Hello User, \n\nGreetings!\n\nWe are glad to convey that your NFT -  ' + name + 'has been created successfully! \n\nIt should be reflected soon in the "My NFTs" section of the "NFT" page.\n\nMoreover, you can also check the created NFT at Opensea platform, by clicking on the following link. \n\nOpen Sea Link: https://testnets.opensea.io/assets/' + address + '/0\n\nNFT Address: ' + address + '\n\nMany thanks for showing interest in the EKA Network platform!\n\nHave an awesome day ahead!'
            );
        }, 30000)
        if (CommandQueue.length == 0) {
            available = true;
        } else {
            var data = CommandQueue.shift();
            ExecuteCommand(data.email, data.name, data.symbol, data.address, data.url);
        }
    });
}

router.get('/tokennft/', function(req, res) { res.status(200).send(""); })
router.post('/tokennft/', async function(req, res) {
    console.log('starting NFT creation ' + req.headers.authUser.email);
    console.log(available + " " + JSON.stringify(CommandQueue));
    fs.writeFile('routes/TempNFTDetails/' + req.files.file.name, req.files.file.data, function(err) {
        if (err) {
            return console.log(err);
        }
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET,
        });
        cloudinary.v2.uploader.upload('routes/TempNFTDetails/' + req.files.file.name, { resource_type: "auto" }, async function(error, resultImage) {
            if (error) {
                console.log("&&&&&&&" + error);
                res.status(201).send();
                return;
            }
            fs.unlink('routes/TempNFTDetails/' + req.files.file.name, (err) => {
                if (err) {
                    throw err;
                }
                // console.log("File is deleted.");
            });
            canCreateToken = false;
            var timestmp = new Date().getTime();
            var data = {
                "id": 0,
                "description": req.body.description,
                "external_url": resultImage.secure_url,
                "image": resultImage.secure_url,
                "name": req.body.description
            }
            res.status(200).send();
            const user = await User.findOneAndUpdate({ email: req.headers.authUser.email }, { isNFTInProgress: true });
            fs.writeFile('routes/TempNFTDetails/' + timestmp + ".json0", JSON.stringify(data), function(err) { if (err) { return console.log(err); } });
            cloudinary.v2.uploader.upload('routes/TempNFTDetails/' + timestmp + ".json0", { resource_type: "auto" }, async function(error, result) {
                if (error) {
                    res.status(201).send();
                    return;
                }
                fs.unlink('routes/TempNFTDetails/' + timestmp + '.json0', (err) => { if (err) throw err; });
                if (available) {
                    ExecuteCommand(req.headers.authUser.email, req.body.name, req.body.symbol, req.body.address, result.secure_url)
                } else {
                    CommandQueue.push({
                        email: req.headers.authUser.email,
                        name: req.body.name,
                        symbol: req.body.symbol,
                        address: req.body.address,
                        url: result.secure_url
                    })
                }
            });
        });
    });
});
module.exports = router;