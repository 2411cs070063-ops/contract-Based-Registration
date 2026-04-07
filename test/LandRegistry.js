const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LandRegistry", function () {
  it("Should register a property correctly", async function () {
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    const landRegistry = await LandRegistry.deploy();
    await landRegistry.waitForDeployment();

    const tx = await landRegistry.registerProperty(
      "PROP101",
      "SURV001",
      "Hyderabad, India",
      1000,
      ethers.parseEther("1.0")
    );
    await tx.wait();

    const property = await landRegistry.getProperty("PROP101");
    expect(property.surveyNumber).to.equal("SURV001");
    expect(property.location).to.equal("Hyderabad, India");
    expect(property.area).to.equal(1000n);
    expect(property.price).to.equal(ethers.parseEther("1.0"));
  });
});
