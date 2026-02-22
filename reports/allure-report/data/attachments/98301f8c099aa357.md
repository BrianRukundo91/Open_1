# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - heading "Document Chat" [level=1] [ref=e6]
        - paragraph [ref=e7]: AI-powered document Q&A
      - button [ref=e8] [cursor=pointer]:
        - img
    - generic [ref=e10]:
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]:
            - img [ref=e15]
            - generic [ref=e18]: "1"
            - generic [ref=e19]: document
          - generic [ref=e21]:
            - generic [ref=e22]: transaction_receipt.txt
            - button "×" [ref=e23] [cursor=pointer]
        - generic [ref=e24]:
          - generic [ref=e25]:
            - button "Choose File" [ref=e26] [cursor=pointer]
            - button "Add Document":
              - img
              - text: Add Document
          - button [ref=e27] [cursor=pointer]:
            - img
      - generic [ref=e30]:
        - img [ref=e32]
        - heading "Start a conversation" [level=3] [ref=e34]
        - paragraph [ref=e35]: Ask any question about your document and get instant AI-powered answers
      - generic [ref=e37]:
        - textbox "Ask a question about your document..." [ref=e38]
        - button [disabled]:
          - img
```