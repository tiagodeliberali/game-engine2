import { CodeComponent } from "../../src/code/CodeComponent";
import { CodeProcessor } from "../../src/code/CodeProcessor";

test('init calls initAction of all initComponents', () => {
    // Arrange
    const processor = new CodeProcessor();
    const component = new CodeComponent(10);
    component.initAction = () => { wasCalled = true; };
    let wasCalled = false;
    
    // Act
    processor.configureCodeComponent(component);
    processor.init();

    // Assert
    expect(wasCalled).toBe(true);
});

test('update calls updateAction of all updateComponents', () => {
    // Arrange
    const processor = new CodeProcessor();
    const component = new CodeComponent(10);
    component.updateAction = () => { wasCalled = true; };
    let wasCalled = false;
    
    // Act
    processor.configureCodeComponent(component);
    processor.update(0);

    // Assert
    expect(wasCalled).toBe(true);
});

test('fixedUpdate calls fixedUpdateAction of all fixedUpdateComponents', () => {
    // Arrange
    const processor = new CodeProcessor();
    const component = new CodeComponent(10);
    component.fixedUpdateAction = () => { wasCalled = true; };
    let wasCalled = false;
    
    // Act
    processor.configureCodeComponent(component);
    processor.fixedUpdate(0);

    // Assert
    expect(wasCalled).toBe(true);
});

test('processor considers priority to run updateAction', () => {
    const first = new CodeComponent(10);
    const second = new CodeComponent(100);
    const third = new CodeComponent(1000);
    
    let result = "";
    first.updateAction = () => { result += "first"; };
    second.updateAction = () => { result += "second"; };
    third.updateAction = () => { result += "third"; };
    
    const processor = new CodeProcessor();
    
    // dones't matter the order
    processor.configureCodeComponent(third);
    processor.configureCodeComponent(first);
    processor.configureCodeComponent(second);

    // act
    processor.update(0);

    // assert
    expect(result).toBe("firstsecondthird");
});

test('processor considers priority to run initAction', () => {
    const first = new CodeComponent(10);
    const second = new CodeComponent(100);
    const third = new CodeComponent(1000);
    
    let result = "";
    first.initAction = () => { result += "first"; };
    second.initAction = () => { result += "second"; };
    third.initAction = () => { result += "third"; };
    
    const processor = new CodeProcessor();
    
    // dones't matter the order
    processor.configureCodeComponent(third);
    processor.configureCodeComponent(first);
    processor.configureCodeComponent(second);

    // act
    processor.init();

    // assert
    expect(result).toBe("firstsecondthird");
});

test('processor considers priority to run fixedUpdateAction', () => {
    const first = new CodeComponent(10);
    const second = new CodeComponent(100);
    const third = new CodeComponent(1000);
    
    let result = "";
    first.fixedUpdateAction = () => { result += "first"; };
    second.fixedUpdateAction = () => { result += "second"; };
    third.fixedUpdateAction = () => { result += "third"; };
    
    const processor = new CodeProcessor();
    
    // dones't matter the order
    processor.configureCodeComponent(third);
    processor.configureCodeComponent(first);
    processor.configureCodeComponent(second);

    // act
    processor.fixedUpdate(0);

    // assert
    expect(result).toBe("firstsecondthird");
});
