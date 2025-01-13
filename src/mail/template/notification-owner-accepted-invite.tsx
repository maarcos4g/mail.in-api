import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Tailwind, Text } from "@react-email/components";

interface NotifyAcceptedInviteToOwnerProps {
  inviterName: string
  guestEmail: string
}

export function NotifyAcceptedInviteToOwner({ inviterName, guestEmail }: NotifyAcceptedInviteToOwnerProps) {
  const previewText = `Novo membro no time!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-465px]">
            <Section className="mt-[32px] text-center">
              <span className="font-bold text-lg">mail.in</span>
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Novo membro no time!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              {inviterName} enviou um convite para o e-mail {guestEmail}, e o convite acabou de ser aceito!
              Temos um novo membro no time!
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Esse é um e-mail automático, não precisa responder.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}