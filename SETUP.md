# SETUP.md — Linux Mint ThinkCentre Setup

This guide documents how to set up the Flying Dutchman dev environment on a ThinkCentre M710s or similar machine.

## 1. Install Linux Mint Cinnamon

- Download ISO from linuxmint.com
- Use Ventoy (not Rufus) for USB boot
- Use a USB 2.0 drive (SanDisk 8GB recommended)
- Boot from back USB port
- Choose Legacy mode if UEFI fails
- Erase disk and install Linux Mint
- Do not encrypt home folder
- Enable Timeshift after install

## 2. First Update

```bash
sudo apt update && sudo apt upgrade -y

3. Essential Tools
bash

sudo apt install git -y
sudo apt install python3 python3-pip -y
sudo apt install htop -y
sudo apt install flameshot -y
sudo apt install curl -y

4. Install Node via fnm
bash

curl -fsSL https://fnm.vercel.app/install | bash
source ~/.bashrc
fnm install --lts
fnm default lts

5. Install VSCodium

Download .deb from https://vscodium.com and install.
6. Performance Tweaks
bash

sudo apt install zram-tools -y
sudo systemctl restart zramswap
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
sudo sysctl vm.swappiness=10

7. Clone and Set Up GHOST
bash

mkdir -p ~/Projects
cd ~/Projects
git clone https://github.com/rafanoobies-sys/ghost-factory.git
cd ghost-factory
npm install

Create .env:
text

GROQ_API_KEY=your_key_here

Test:
bash

node ghost/cli.js --help

8. Desktop Tweaks

    Disable startup apps not needed

    Disable desktop effects/animations

    Use Firefox or Brave instead of Chrome

    Keep Timeshift snapshots lean (2–3 weekly)

Next Steps

    Install more tools only when needed

    Keep projects in ~/Projects

    Commit after each work session

    Push to GitHub as backup
