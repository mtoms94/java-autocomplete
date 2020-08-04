# java-autocomplete

## Intro

For this project I decided to focus on the two parts of code completion programs that I find myself using the most: method suggestions and constructor parameter options.

## Installation and Examples

From the root directory:

```sh
npm install
npm start <path-to-file> <index>
```

### Custom Method Suggestion

![Example One](images/ExampleOne.png)

```sh
npm start examples/ExampleOne.java 223
```

Output:

```sh
----------------------------------------------------------------------------------------------------
someMethod( )                                       | return type:  int
getClass( )                                         | return type:  Class
hashCode( )                                         | return type:  int
equals( Object obj )                                | return type:  boolean
toString( )                                         | return type:  String
notify( )                                           | return type:
notifyAll( )                                        | return type:
wait( )                                             | return type:  InterruptedException
wait( long timeoutMillis )                          | return type:  long
wait( long timeoutMillis , int nanos )              | return type:  long
----------------------------------------------------------------------------------------------------
```

### Process
